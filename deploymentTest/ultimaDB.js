const dbManager = require('../dbManager.js');
const {createDatabase, createTables} = require('./createDB.js');
const {generateRandomPoints, generateRestaurants, generateRestaurantAuthentications, generateRestaurantItems, batchInsertRestaurant} = require('./insertDB.js');
const {generateCustomers, batchInsertCustomer, generateOrders, batchInsertOrder, generateCategory, batchInsertCategory} = require('./insertDB.js');

const filePath = './Food4U_DB_CREATE.sql';

const initialCoordinate = {
    latitude: -34.408909, // UOW Latitude Coordinate
    longitude: 150.885437 // UOW Longitude Coordinate
}

const radius = 50000;

const restaurantQuantity = 10;
const customerQuantity = 10;
const orderQuantity = 20;
const itemPerRestaurant = 5;

const categories = ['Italian', 'Japanese', 'Mexican', 'Chinese', 'Indian', 'Thai', 'American', 'French', 'Mediterranean', 'Vegetarian'];

async function deployDatabase() {
    let mySQLServer = null;
    let database = null;
    let databaseConnection = null;

    try {
        const db = new dbManager();
        mySQLServer = await db.getMySQLServer();
        await createDatabase(mySQLServer);
        mySQLServer.end();
        mySQLServer = null;

        database = await db.getDatabase();
        databaseConnection = await database.promise().getConnection();
        await createTables(databaseConnection, filePath);

        const randomGeoPoints = generateRandomPoints(initialCoordinate, radius, restaurantQuantity);
        const restaurants = generateRestaurants(randomGeoPoints, restaurantQuantity);
        const restaurantAuthentications = generateRestaurantAuthentications(restaurants); 
        const restaurantItems = generateRestaurantItems(restaurants);

        await batchInsertRestaurant(databaseConnection, restaurants, restaurantAuthentications, restaurantItems);

        const customerInformation = generateCustomers(customerQuantity);
        const customers = customerInformation.customerList;
        const customerAuthentications = customerInformation.customerAuthenticationList;
        const customerPayments = customerInformation.customerPaymentList;

        await batchInsertCustomer(databaseConnection, customers, customerAuthentications, customerPayments);

        const orderInformation = generateOrders(restaurantItems, itemPerRestaurant, orderQuantity);
        const orderList = orderInformation.orderList;
        const orderItemList = orderInformation.orderItemList;

        await batchInsertOrder(databaseConnection, orderList, orderItemList);

        const categoryInformation = generateCategory(categories);
        const categoryList = categoryInformation.categoryList;
        const categoryRestaurants = categoryInformation.categoryRestaurants;

        await batchInsertCategory(databaseConnection, categoryList,categoryRestaurants);

        await databaseConnection.commit();
    } catch(error) {
        console.error('Error creating database: ' + error.stack);
        if (databaseConnection !== null) {
            databaseConnection.rollback();
        }
    } finally {
        if (mySQLServer !== null) {
            mySQLServer.end();
        }

        if (databaseConnection !== null) {
            databaseConnection.release();
        }

        if (database !== null) {
            database.end();
        }
    }
}

deployDatabase();