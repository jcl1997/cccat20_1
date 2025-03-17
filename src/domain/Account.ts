import crypto from "crypto";
import { validateCpf } from "./ValidateCpf";
import { validatePassword } from "./ValidatePassword";

export default class Account {
    constructor (
        readonly accountId: string,
        readonly name: string,
        readonly email: string,
        readonly cpf: string,
        readonly password: string,
        readonly carPlate: string,
        readonly isPassenger: boolean,
        readonly isDriver: boolean
    ) {
        if (!this.validateName(name)) throw new Error("Invalid name");
        if (!this.validateEmail(email)) throw new Error("Invalid email");
        if (!validatePassword(this.password)) throw new Error("Invalid password");
        if (!validateCpf(this.cpf)) throw new Error("Invalid cpf");
        if (this.isDriver && !this.carPlate.match(/[A-Z]{3}[0-9]{4}/)) throw new Error('Invalid car plate');
    }

    validateName (name: string) {
        return name.match(/[a-zA-Z] [a-zA-Z]+/);
    }

    validateEmail (email: string) {
        return email.match(/^(.+)@(.+)$/);
    }

    static create (
        name: string,
        email: string,
        cpf: string,
        password: string,
        carPlate: string,
        isPassenger: boolean,
        isDriver: boolean
    ) {
        const accountId = crypto.randomUUID();
        return new Account(accountId, name, email, cpf, password, carPlate, isPassenger, isDriver);
    }
}