import pgp from "pg-promise";

export default interface DatabaseConnection {
    query (statement: string, params: any): Promise<any>;
    close (): Promise<any>;
}

export class PgPromiseAdapter implements DatabaseConnection {
    connection: any;
    constructor () {
        this.connection = pgp()("postgres://postgres:123456@postgres:5432/app");
    }

    query(statement: string, params: any): Promise<any> {
        return this.connection.query(statement, params);
    }

    async close(): Promise<any> {
        this.connection.$pool.end();
    }
}