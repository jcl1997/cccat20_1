import Account from "../../domain/Account";
import DatabaseConnection from "../database/DatabaseConnection";
import { inject } from "../di/Registry";

export default interface AccountRepository {
    getAccountByEmail(email: string): Promise<Account | undefined>;
    getAccountById(accountId: string): Promise<Account>;
    saveAccount(account: Account): Promise<void>;
}

export class AccountRepositoryDatabase implements AccountRepository {
    @inject('databaseConnection')
    connection!: DatabaseConnection;

    async getAccountByEmail(email: string): Promise<Account | undefined> {
        const [accountData] = await this.connection.query("select * from ccca.account where email = $1", [email]);
        if (!accountData) return;
        return new Account(accountData.account_id, accountData.name, accountData.email, accountData.cpf, accountData.password, accountData.car_plate, accountData.is_passenger, accountData.is_driver);
    }
    
    async getAccountById(accountId: string): Promise<Account>{
        const [accountData] = await this.connection.query("select * from ccca.account where account_id = $1", [accountId]);
        return new Account(accountData.account_id, accountData.name, accountData.email, accountData.cpf, accountData.password, accountData.car_plate, accountData.is_passenger, accountData.is_driver);
    }
    
    async saveAccount(account: Account): Promise<void> {
        await this.connection.query("insert into ccca.account (account_id, name, email, cpf, car_plate, is_passenger, is_driver, password) values ($1, $2, $3, $4, $5, $6, $7, $8)", [account.accountId, account.name, account.email, account.cpf, account.carPlate, !!account.isPassenger, !!account.isDriver, account.password]);
    }
}


export class AccountRepositoryMemory implements AccountRepository {
    accounts: any[] = [];

    async getAccountByEmail(email: string) {
        return this.accounts.find((account) => account.email === email);
    }
    
    async getAccountById(accountId: string) {
        return this.accounts.find((account) => account.accountId === accountId);
    }
    
    async saveAccount(account: any) {
        this.accounts.push({
            accountId: account.accountId,
            name: account.name,
            email: account.email,
            cpf: account.cpf,
            password: account.password,
            is_driver: account.isDriver,
            car_plate: account.carPlate
        });
    }
}