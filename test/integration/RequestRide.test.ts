import DatabaseConnection, { PgPromiseAdapter } from "../../src/infra/database/DatabaseConnection";
import GetRide from "../../src/application/usecase/GetRide";
import Registry from "../../src/infra/di/Registry";
import RequestRide from "../../src/application/usecase/RequestRide";
import { RideRepositoryDatabase } from "../../src/infra/repository/RideRepository";
import Signup from "../../src/application/usecase/Signup";
import { AccountRepositoryDatabase } from "../../src/infra/repository/AccountRepository";

let signup: Signup;
let requestRide: RequestRide;
let getRide: GetRide;
let databaseConnection: DatabaseConnection;
beforeEach(() => {
    databaseConnection = new PgPromiseAdapter();
    const accountRepository = new AccountRepositoryDatabase();
    const rideRepository = new RideRepositoryDatabase();
    Registry.getInstance().provide("databaseConnection", databaseConnection);
    Registry.getInstance().provide("accountRepository", accountRepository);
    Registry.getInstance().provide("rideRepository", rideRepository);
    signup = new Signup();
    requestRide = new RequestRide();
    getRide = new GetRide();
});

test('Deve solicitar uma corriga', async function () {

    const inputSignup = {
        name: "John Doe",
        email: `john.doe${Math.random()}@gmail.com`,
        cpf: "97456321558",
        password: "asdQWE123",
        isPassenger: true,
        isDriver: false,
        carPlate: ''
    };
    const outputSignup = await signup.execute(inputSignup);
    const inputResquestRide = {
        passengerId: outputSignup.accountId,
        fromLat: -27.584905257808835,
        fromLong: -48.545022195325124,
        toLat: -27.496887588317275,
        toLong: -48.522234807851476,
    };
    const outputRequestRide = await requestRide.execute(inputResquestRide);
    expect(outputRequestRide.rideId).toBeDefined();
    const outputGetRide = await getRide.execute(outputRequestRide.rideId);
    expect(outputGetRide.rideId).toEqual(outputRequestRide.rideId);
    expect(outputGetRide.passengerId).toEqual(inputResquestRide.passengerId);
    expect(outputGetRide.fromLat).toEqual(inputResquestRide.fromLat);
    expect(outputGetRide.fromLong).toEqual(inputResquestRide.fromLong);
    expect(outputGetRide.toLat).toEqual(inputResquestRide.toLat);
    expect(outputGetRide.toLong).toEqual(inputResquestRide.toLong);
    expect(outputGetRide.fare).toEqual(21);
    expect(outputGetRide.distance).toEqual(10);
    expect(outputGetRide.status).toEqual('requested');
});

test('Não deve solicitar uma corriga se não for um passageiro', async function () {
    const inputSignup = {
        name: "John Doe",
        email: `john.doe${Math.random()}@gmail.com`,
        cpf: "97456321558",
        password: "asdQWE123",
        isDriver: true,
        isPassenger: false,
        carPlate: "AAA9999"
    };
    const outputSignup = await signup.execute(inputSignup);
    const inputResquestRide = {
        passengerId: outputSignup.accountId,
        fromLat: -27.584905257808835,
        fromLong: -48.545022195325124,
        toLat: -27.496887588317275,
        toLong: -48.522234807851476,
    };
    await expect(() => requestRide.execute(inputResquestRide)).rejects.toThrow(new Error('The requester must be a passenger'));
});

test('Não deve solicitar uma corriga se o passageiro já tiver uma corridaem andamento', async function () {
    const inputSignup = {
        name: "John Doe",
        email: `john.doe${Math.random()}@gmail.com`,
        cpf: "97456321558",
        password: "asdQWE123",
        isPassenger: true,
    };
    const outputSignup = await signup.execute(inputSignup);
    const inputResquestRide = {
        passengerId: outputSignup.accountId,
        fromLat: -27.584905257808835,
        fromLong: -48.545022195325124,
        toLat: -27.496887588317275,
        toLong: -48.522234807851476,
    };
    await requestRide.execute(inputResquestRide);
    await expect(() => requestRide.execute(inputResquestRide)).rejects.toThrow(new Error('The requester already have an active ride'));
});

test('Não deve solicitar uma corriga se a lattitude ou longitude estiverem inválidas', async function () {
    const inputSignup = {
        name: "John Doe",
        email: `john.doe${Math.random()}@gmail.com`,
        cpf: "97456321558",
        password: "asdQWE123",
        isPassenger: true,
    };
    const outputSignup = await signup.execute(inputSignup);
    const inputResquestRide = {
        passengerId: outputSignup.accountId,
        fromLat: -140,
        fromLong: -48.545022195325124,
        toLat: -27.496887588317275,
        toLong: -48.522234807851476,
    };
    await expect(() => requestRide.execute(inputResquestRide)).rejects.toThrow(new Error('The latitude is invalid'));
});

afterEach(async () => {
    await databaseConnection.close();
});