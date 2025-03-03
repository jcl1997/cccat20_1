import pgp from "pg-promise";
import crypto from "crypto";

export default interface AccountDao {
    getAccountByEmail(email: string): Promise<any>;
    getAccountById(accountId: string): Promise<any>;
    saveAccount(account: any): Promise<void>;
}

export class AccountDaoDatabase implements AccountDao {
    async getAccountByEmail(email: string) {
        const connection = pgp()("postgres://postgres:123456@postgres:5432/app");
        const [account] = await connection.query("select * from ccca.account where email = $1", [email]);
        await connection.$pool.end();
        return account
    }
    
    async getAccountById(accountId: string) {
        const connection = pgp()("postgres://postgres:123456@postgres:5432/app");
        const [account] = await connection.query("select * from ccca.account where account_id = $1", [accountId]);
        await connection.$pool.end();
        return account;
    }
    
    async saveAccount(account: any) {
        const connection = pgp()("postgres://postgres:123456@postgres:5432/app");
        await connection.query("insert into ccca.account (account_id, name, email, cpf, car_plate, is_passenger, is_driver, password) values ($1, $2, $3, $4, $5, $6, $7, $8)", [account.accountId, account.name, account.email, account.cpf, account.carPlate, !!account.isPassenger, !!account.isDriver, account.password]);
        await connection.$pool.end();
    }
}


export class AccountDaoMemory implements AccountDao {
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