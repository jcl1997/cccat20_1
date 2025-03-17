import Account from "../../domain/Account";
import { inject } from "../../infra/di/Registry";
import AccountRepository from "../../infra/repository/AccountRepository";

export default class GetAccount {
	@inject('accountRepository')
	accountRepository!: AccountRepository;

	async execute(accountId: string): Promise<Account> {
		const account = await this.accountRepository.getAccountById(accountId);
		return account;
	};
}
