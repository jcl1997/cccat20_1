import Account from "../../src/domain/Account";
import DatabaseConnection, { PgPromiseAdapter } from "../../src/infra/database/DatabaseConnection";
import GetAccount from "../../src/application/usecase/GetAccount";
import Registry from "../../src/infra/di/Registry";
import Signup from "../../src/application/usecase/Signup";
import sinon from "sinon"
import { AccountRepositoryDatabase, AccountRepositoryMemory } from "../../src/infra/repository/AccountRepository";

let signup: Signup;
let getAccount: GetAccount;
let databaseConnection: DatabaseConnection;

beforeEach(() => {
    databaseConnection = new PgPromiseAdapter();
    const accountRepository = new AccountRepositoryDatabase();
    Registry.getInstance().provide("databaseConnection", databaseConnection);
    Registry.getInstance().provide("accountRepository", accountRepository);
    // const accountRepository = new AccountDaoMemory();
    signup = new Signup();
    getAccount = new GetAccount();
})

test("Deve fazer a criação da conta de um usuáriso do tipo passageiro", async function () {
    const input = {
        name: "John Doe",
        email: `john.doe${Math.random()}@gmail.com`,
        cpf: "97456321558",
        password: "asdQWE123",
        isPassenger: true,
    };
    const outputSignup = await signup.execute(input);
    expect(outputSignup.accountId).toBeDefined();
    const outputGetAccount = await getAccount.execute(outputSignup.accountId);
    expect(outputGetAccount.name).toBe(input.name)
    expect(outputGetAccount.email).toBe(input.email)
    expect(outputGetAccount.cpf).toBe(input.cpf)
    expect(outputGetAccount.password).toBe(input.password)
});

test("Deve fazer a criação da conta de um usuáriso do tipo motorista", async function () {
    const input = {
        name: "John Doe",
        email: `john.doe${Math.random()}@gmail.com`,
        cpf: "97456321558",
        password: "asdQWE123",
        isDriver: true,
        carPlate: "AAA9999"
    };
    const outputSignup = await signup.execute(input);
    expect(outputSignup.accountId).toBeDefined();
    const outputGetAccount = await getAccount.execute(outputSignup.accountId);
    expect(outputGetAccount.name).toBe(input.name)
    expect(outputGetAccount.email).toBe(input.email)
    expect(outputGetAccount.cpf).toBe(input.cpf)
    expect(outputGetAccount.password).toBe(input.password)
    expect(outputGetAccount.carPlate).toBe(input.carPlate)
    expect(outputGetAccount.isDriver).toBe(input.isDriver)
});

test("Não Deve fazer a criação da conta de um usuáriso se o nome for invalido", async function () {
    const input = {
        name: "John",
        email: `john.doe${Math.random()}@gmail.com`,
        cpf: "97456321558",
        password: "asdQWE123",
        isPassenger: true,
    };
    await expect(signup.execute(input)).rejects.toThrow(new Error("Invalid name"));
});

test("Não Deve fazer a criação da conta de um usuáriso se o email for invalido", async function () {
    const input = {
        name: "John Doe",
        email: `john.doe${Math.random()}`,
        cpf: "97456321558",
        password: "asdQWE123",
        isPassenger: true,
    };
    await expect(signup.execute(input)).rejects.toThrow(new Error("Invalid email"));
});

test("Não Deve fazer a criação da conta de um usuáriso se o cpf for invalido", async function () {
    const input = {
        name: "John Doe",
        email: `john.doe${Math.random()}@gmail.com`,
        cpf: "00000000000",
        password: "asdQWE123",
        isPassenger: true,
    };
    await expect(signup.execute(input)).rejects.toThrow(new Error("Invalid cpf"));
});

test("Não Deve fazer a criação da conta de um usuáriso se o password for invalido", async function () {
    const input = {
        name: "John Doe",
        email: `john.doe${Math.random()}@gmail.com`,
        cpf: "97456321558",
        password: "asdqwe123",
        isPassenger: true,
    };
    await expect(signup.execute(input)).rejects.toThrow(new Error("Invalid password"));
});

test("Não Deve fazer a criação da conta de um usuáriso se a conta estiver duplicada", async function () {
    const input = {
        name: "John Doe",
        email: `john.doe${Math.random()}@gmail.com`,
        cpf: "97456321558",
        password: "asdQWE123",
        isPassenger: true,
    };
    await signup.execute(input);
    await expect(signup.execute(input)).rejects.toThrow(new Error("Account already exists"));
});

test("Não Deve fazer a criação da conta de um usuáriso se a placa estiver inválida", async function () {
    const input = {
        name: "John Doe",
        email: `john.doe${Math.random()}@gmail.com`,
        cpf: "97456321558",
        password: "asdQWE123",
        carPlate: "AAA999",
        isDriver: true,
    };
    await expect(signup.execute(input)).rejects.toThrow(new Error('Invalid car plate'));
});

test("Deve fazer a criação da conta de um usuáriso do tipo passageiro com stub", async function () {
    const account = Account.create("John Doe", `john.doe${Math.random()}@gmail.com`, '97456321558', 'asdQWE123', '', true, false);
    const savaAccountStub = sinon.stub(AccountRepositoryDatabase.prototype, "saveAccount").resolves();
    const getAccountByEmailStub = sinon.stub(AccountRepositoryDatabase.prototype, "getAccountByEmail").resolves();
    const getAccountByIdStub = sinon.stub(AccountRepositoryDatabase.prototype, "getAccountById").resolves(account);
    const outputSignup = await signup.execute(account);
    expect(outputSignup.accountId).toBeDefined();
    const outputGetAccount = await getAccount.execute(outputSignup.accountId);
    expect(outputGetAccount.name).toBe(account.name)
    expect(outputGetAccount.email).toBe(account.email)
    expect(outputGetAccount.cpf).toBe(account.cpf)
    expect(outputGetAccount.password).toBe(account.password)
    savaAccountStub.restore();
    getAccountByEmailStub.restore();
    getAccountByIdStub.restore();
});

test("Deve faze a criação da conta de um usuáriso do tipo passageiro com spy", async function () {
    const saveAccountSpy = sinon.spy(AccountRepositoryDatabase.prototype, "saveAccount")
    const getAccountByIdSpy = sinon.spy(AccountRepositoryDatabase.prototype, "getAccountById")
    const input = {
        name: "John Doe",
        email: `john.doe${Math.random()}@gmail.com`,
        cpf: "97456321558",
        password: "asdQWE123",
        isPassenger: true,
    };

    const outputSignup = await signup.execute(input);
    expect(outputSignup.accountId).toBeDefined();
    const outputGetAccount = await getAccount.execute(outputSignup.accountId);
    expect(outputGetAccount.name).toBe(input.name);
    expect(outputGetAccount.email).toBe(input.email);
    expect(outputGetAccount.cpf).toBe(input.cpf);
    expect(outputGetAccount.password).toBe(input.password);
    expect(saveAccountSpy.calledOnce).toBe(true);
    expect(getAccountByIdSpy.calledWith(outputSignup.accountId)).toBe(true);
    saveAccountSpy.restore();
    getAccountByIdSpy.restore();
});

test("Deve faze a criação da conta de um usuáriso do tipo passageiro com mock", async function () {
    const input = {
        name: "John Doe",
        email: `john.doe${Math.random()}@gmail.com`,
        cpf: "97456321558",
        password: "asdQWE123",
        isPassenger: true,
    };
    const accountDaoMock = sinon.mock(AccountRepositoryDatabase.prototype);
    accountDaoMock.expects("saveAccount").once().resolves();
    const outputSignup = await signup.execute(input);
    expect(outputSignup.accountId).toBeDefined();
    accountDaoMock.expects("getAccountById").once().withArgs(outputSignup.accountId).resolves(input);
    const outputGetAccount = await getAccount.execute(outputSignup.accountId);
    expect(outputGetAccount.name).toBe(input.name);
    expect(outputGetAccount.email).toBe(input.email);
    expect(outputGetAccount.cpf).toBe(input.cpf);
    expect(outputGetAccount.password).toBe(input.password);
    accountDaoMock.verify();
    accountDaoMock.restore();
});

test("Deve faze a criação da conta de um usuáriso do tipo passageiro com fake", async function () {
    const accountRepository = new AccountRepositoryMemory();
    Registry.getInstance().provide("accountRepository", accountRepository);
    signup = new Signup();
    getAccount = new GetAccount();
    const input = {
        name: "John Doe",
        email: `john.doe${Math.random()}@gmail.com`,
        cpf: "97456321558",
        password: "asdQWE123",
        isPassenger: true,
    };
    const outputSignup = await signup.execute(input);
    expect(outputSignup.accountId).toBeDefined();
    const outputGetAccount = await getAccount.execute(outputSignup.accountId);
    expect(outputGetAccount.name).toBe(input.name);
    expect(outputGetAccount.email).toBe(input.email);
    expect(outputGetAccount.cpf).toBe(input.cpf);
    expect(outputGetAccount.password).toBe(input.password);;
});

afterEach(async () => {
    await databaseConnection.close();
});
