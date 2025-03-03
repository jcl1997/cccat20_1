import AccountDao from "./data";

export default class GetAccount {
	constructor (readonly accountDao: AccountDao) {
	}

	async execute(accountId: string): Promise<any> {
		const output = await this.accountDao.getAccountById(accountId);
		return output;
	};
}
