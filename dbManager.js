const mysql = require('mysql2');
class dbManager {
    constructor() {
        this.host = "localhost";
        this.user = "root";
        this.password = "ngaymai123";
        this.database = "FOOD4U";
    }

    async getMySQLServer() {
        const connection = mysql.createConnection({
            host: this.host,
            user: this.user,
            password: this.password
        });

        return connection;
    }

    async getDatabase() {
        const database = mysql.createPool({
            host: this.host,
            user: this.user,
            password: this.password,
            database: this.database
        });

        return database;
    }

    getPoolForServer() {
        const database = mysql.createPool({
            host: this.host,
            user: this.user,
            password: this.password,
            database: this.database,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
          });

        return database;
    }
}

module.exports = dbManager;