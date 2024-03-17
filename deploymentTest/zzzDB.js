const dbManager = require('../dbManager.js');

async function dropDatabase() {
    const db = new dbManager();
    const databaseName = db.database;
    let mySQLServer = null;
    try {
        mySQLServer = await db.getMySQLServer();
        await mySQLServer.promise().connect();
        
        const sql = `DROP DATABASE ${databaseName}`;
        await mySQLServer.promise().query(sql);
        mySQLServer.end();
        mySQLServer = null;

        console.log(`Drop Database ${databaseName} Operation Completed!`);
    } catch(error) {
        console.log("Error When Dropping Database: " + error.stack);
    } finally {
        if (mySQLServer !== null) {
            mySQLServer.end();
        }
    }
}

dropDatabase();