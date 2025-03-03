import crypto from "crypto";
import { validateCpf } from "./validateCpf";
import { validatePassword } from "./validatePassword";
import AccountDao  from "./data";


export default class Signup {
	constructor (readonly accountDao: AccountDao) {
	}

	async execute(input: any) {
		const account = {
			accountId: crypto.randomUUID(),
			...input
		}
		const existingAccount = await this.accountDao.getAccountByEmail(account.email);
		if (existingAccount)  throw new Error("Account already exists");
		if (!account.name.match(/[a-zA-Z] [a-zA-Z]+/)) throw new Error("Invalid name");
		if (!account.email.match(/^(.+)@(.+)$/)) throw new Error("Invalid email");
		if (!validatePassword(account.password)) throw new Error("Invalid password");
		if (!validateCpf(account.cpf)) throw new Error("Invalid cpf");
		if (account.isDriver && !account.carPlate.match(/[A-Z]{3}[0-9]{4}/)) throw new Error('Invalid car plate');
		await this.accountDao.saveAccount(account);
		return {
			accountId: account.accountId
		};
	}
}
