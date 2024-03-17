const Order = require('../class/Order.js');

/**
* Generates number of random geolocation points given a center and a radius.
* @param  {Object} center A JS object with lat and lng attributes.
* @param  {number} radius Radius in meters.
* @param {number} count Number of points to generate.
* @return {array} Array of Objects with lat and lng attributes.
*/
function generateRandomPoints(center, radius, count) {
    var points = [];
    for (var i=0; i<count; i++) {
      points.push(generateRandomPoint(center, radius));
    }
    return points;
  }
  
  
/**
 * Generates number of random geolocation points given a center and a radius.
 * 
 * @param  {Object} center A JS object with lat and lng attributes.
 * @param  {number} radius Radius in meters.
 * @return {Object} The generated random points as JS object with lat and lng attributes.
 */
function generateRandomPoint(center, radius) {
var x0 = center.longitude;
var y0 = center.latitude;
// Convert Radius from meters to degrees.
var rd = radius/111300;

var u = Math.random();
var v = Math.random();

var w = rd * Math.sqrt(u);
var t = 2 * Math.PI * v;
var x = w * Math.cos(t);
var y = w * Math.sin(t);

var xp = x/Math.cos(y0);

// Resulting point.
return {'latitude': y+y0, 'longitude': xp+x0};
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRestaurants(geoPoints, restaurantQuantity) {
    let restaurantList = [];
    for (let i = 0; i < restaurantQuantity; i++) {
        const restaurantEmail = "restaurant" + (i + 1).toString() + "@mail.com"
        const restaurantName = "Restaurant " + (i + 1).toString();
        const restaurantPhone = "01234567890";
        const restaurantABN = 12345678901;
        const restaurantBanking = 12345678901;
        const restaurantLocation = "Wollongong";
        const restaurantLat = geoPoints[i].latitude;
        const restaurantLon = geoPoints[i].longitude;
        const restaurantTotalOrder = getRandomInt(1, 10);
        const restaurantTotalRating = getRandomInt(restaurantTotalOrder, restaurantTotalOrder*5);
        const restaurantIMG = "defaultRestaurant.png"
        const isActive = true;

        const aRestaurant = {
            restaurantEmail: restaurantEmail,
            restaurantName: restaurantName,
            restaurantPhone: restaurantPhone,
            restaurantABN: restaurantABN,
            restaurantBanking: restaurantBanking,
            restaurantLocation: restaurantLocation,
            restaurantLat: restaurantLat,
            restaurantLon: restaurantLon,
            restaurantTotalRating: restaurantTotalRating,
            restaurantTotalOrder: restaurantTotalOrder,
            restaurantIMG: restaurantIMG,
            isActive: isActive
        }

        restaurantList.push(aRestaurant)
    }

    return restaurantList;
}

function generateRestaurantAuthentications(restaurants) {
    let restaurantAuthenticationList = [];
    for (let i = 0; i < restaurants.length; i++) {
        const restaurantEmail = restaurants[i].restaurantEmail
        const restaurantPassword = restaurants[i].restaurantEmail.split("@")[0] + "password";

        const aRestaurantAuthentication = {
            restaurantEmail: restaurantEmail,
            restaurantPassword: restaurantPassword
        }

        restaurantAuthenticationList.push(aRestaurantAuthentication)
    }

    return restaurantAuthenticationList;
}

function generateRestaurantItems(restaurants) {
    let restaurantItemList = [];
    for (let i = 0; i < restaurants.length; i++) {
        for (let j = 0; j < 5; j++) {
            const restaurantCode = i + 1;
            const itemName = restaurants[i].restaurantName + " Item " + (j + 1);
            const itemPrice = getRandomInt(10, 30);
            const itemIMG = "defaultItem.png";
    
            const aRestaurantItem = {
                restaurantCode: restaurantCode,
                itemName: itemName,
                itemPrice: itemPrice,
                itemIMG: itemIMG,
            }

            restaurantItemList.push(aRestaurantItem)
        }
    }

    return restaurantItemList;
}

async function batchInsertRestaurant(dbConnection, restaurants, restaurantAuthentications, restaurantItems) {
    try {
        // Begin a transaction
        await dbConnection.beginTransaction();

        // Prepare the insert query
        const queryRestaurant = 
        'INSERT INTO RESTAURANT (restaurantEmail, restaurantName, restaurantPhone, restaurantABN, restaurantBanking, restaurantLocation, restaurantLat, restaurantLon, restaurantTotalRating, restaurantTotalOrder, restaurantIMG, isActive) VALUES ?';

        // Format the data for batch insert
        const valueRestaurant = 
        restaurants.map(item => 
            [
                item.restaurantEmail,
                item.restaurantName,
                item.restaurantPhone,
                item.restaurantABN,
                item.restaurantBanking,
                item.restaurantLocation,
                item.restaurantLat,
                item.restaurantLon,
                item.restaurantTotalRating,
                item.restaurantTotalOrder,
                item.restaurantIMG,
                item.isActive
            ]);

        // Execute the batch insert query
        await dbConnection.query(queryRestaurant, [valueRestaurant]);

        // Prepare the insert query
        const queryRestaurantAuthentication = 
        'INSERT INTO RESTAURANT_AUTHENTICATION (restaurantEmail, restaurantPassword) VALUES ?';

        const valueRestaurantAuthentication = 
        restaurantAuthentications.map(item => 
            [
                item.restaurantEmail,
                item.restaurantPassword
            ]);

        await dbConnection.query(queryRestaurantAuthentication, [valueRestaurantAuthentication]);

        // Prepare the insert query
        const queryRestaurantItem = 
        'INSERT INTO RESTAURANT_ITEM (restaurantCode, itemName, itemPrice, itemIMG) VALUES ?';

        const valueRestaurantItem = 
        restaurantItems.map(item => 
            [
                item.restaurantCode,
                item.itemName,
                item.itemPrice,
                item.itemIMG
            ]);

        await dbConnection.query(queryRestaurantItem, [valueRestaurantItem]);

        console.log('Batch insert restaurant successful');
    } catch (error) {
        // Rollback the transaction if an error occurred
        console.error('Batch insert restaurant failed:');
        throw error;
    }
}

function generateCustomers(customerQuantity) {
    let customerList = [];
    let customerAuthenticationList = [];
    let customerPaymentList = [];
    for (let i = 0; i < customerQuantity; i++) {
        const customerEmail = "customer" + (i + 1).toString() + "@mail.com"
        const customerName = "Customer " + (i + 1).toString();
        const customerPhone = "091234567891";
        let membershipEnd;
        const customerPassword = "password" + (i+1).toString();

        const hasMembership = getRandomInt(0, 1);

        if (hasMembership === 0) {
            membershipEnd = '2024-09-01';
        } else {
            membershipEnd = null;
        }

        const isActive = true;

        const customerCode = (i+1);
        const cardNumber = '1234567890123456'
        const cardOwner = customerName;
        const cardExpMonth = 12;
        const cardExpYear = 2027;

        const aCustomer = {
            customerEmail: customerEmail,
            customerName: customerName,
            customerPhone: customerPhone,
            membershipEnd: membershipEnd,
            isActive: isActive
        }

        const aCustomerAuthentication = {
            customerEmail: customerEmail,
            customerPassword: customerPassword
        }

        const aCustomerPayment = {
            customerCode: customerCode,
            cardNumber: cardNumber,
            cardOwner: cardOwner,
            cardExpMonth: cardExpMonth,
            cardExpYear: cardExpYear
        }

        customerList.push(aCustomer);
        customerAuthenticationList.push(aCustomerAuthentication);
        customerPaymentList.push(aCustomerPayment);
    }

    return ({
        customerList: customerList,
        customerAuthenticationList: customerAuthenticationList,
        customerPaymentList: customerPaymentList
    });
}

async function batchInsertCustomer(dbConnection, customers, customerAuthentications, customerPayments) {
    try {
        // Begin a transaction
        await dbConnection.beginTransaction();

        // Prepare the insert query
        const queryCustomer = 
        'INSERT INTO CUSTOMER (customerEmail, customerName, customerPhone, membershipEnd, isActive) VALUES ?';

        // Format the data for batch insert
        const valueCustomer = 
        customers.map(item => 
            [
                item.customerEmail,
                item.customerName,
                item.customerPhone,
                item.membershipEnd,
                item.isActive
            ]);

        // Execute the batch insert query
        await dbConnection.query(queryCustomer, [valueCustomer]);

        // Prepare the insert query
        const queryCustomerAuthentication = 
        'INSERT INTO CUSTOMER_AUTHENTICATION (customerEmail, customerPassword) VALUES ?';

        const valueCustomerAuthentication = 
        customerAuthentications.map(item => 
            [
                item.customerEmail,
                item.customerPassword
            ]);

        await dbConnection.query(queryCustomerAuthentication, [valueCustomerAuthentication]);

        // Prepare the insert query
        const queryCustomerPayment = 
        'INSERT INTO CUSTOMER_PAYMENT (customerCode, cardNumber, cardOwner, cardExpMonth, cardExpYear) VALUES ?';

        const valueCustomerPayment = 
        customerPayments.map(item => 
            [
                item.customerCode,
                item.cardNumber,
                item.cardOwner,
                item.cardExpMonth,
                item.cardExpYear
            ]);

        await dbConnection.query(queryCustomerPayment, [valueCustomerPayment]);        

        console.log('Batch insert customer successful');
    } catch (error) {
        // Rollback the transaction if an error occurred
        console.error('Batch insert customer failed:');
        throw error;
    }
}

function generateOrders(restaurantItems, itemPerRestaurant, orderQuantity) {
    let orderList = [];
    let orderItemList = [];

    const timeInfo = Order.getServerOrderTime();
    const year = timeInfo[0];
    const month = timeInfo[1];
    const date = timeInfo[2];
    const hour = timeInfo[3];
    const minute = timeInfo[4];
    const second = parseInt(timeInfo[5]);

    const orderDate = `${year}-${month}-${date}`;

    const names = ["Ephyliana Everlight", "Donald Trump", "Nino Nakano", "Eris Boreas Greyrat", "Rem"];
    let orderCostCalculated = 0;
    for (let ik = 0; ik < itemPerRestaurant; ik++) {
        orderCostCalculated += restaurantItems[ik].itemPrice;
    }

    const orderCost = orderCostCalculated;

    for (let i = 0; i < orderQuantity; i++) {
        const customerCode = 1;
        const recipientNameIndex = getRandomInt(0, 4);
        const recipientName = names[recipientNameIndex];
        const recipientPhone = "091234567890";
        const restaurantCode = 1;
        const orderCode = `OC${customerCode}R${restaurantCode}T${year}${month}${date}${hour}${minute}${(second+i).toString()}`;
        const orderStatus = getRandomInt(0, 4);
        const orderLocation = "University of Wollongong";
        let courierName = `Restaurant ${restaurantCode} Courier`;
        let courierPhone = "420420420420";
        let orderReview = null;
        let orderRating = null;
        let rejectReason = null;

        if (orderStatus === 0) {
            rejectReason = "Can Not Do";
        }

        if (orderStatus === 1) {
            courierName = null;
            courierPhone = null;
        }

        if (orderStatus === 3) {
            orderReview = "Good Job!";
            orderRating = getRandomInt(1,5);
        }

        const anOrder = {
            customerCode: customerCode,
            recipientName: recipientName,
            recipientPhone: recipientPhone,
            orderCode: orderCode,
            restaurantCode: restaurantCode,
            orderStatus: orderStatus,
            orderLocation: orderLocation,
            courierName: courierName,
            courierPhone: courierPhone,
            orderReview: orderReview,
            orderRating: orderRating,
            orderDate: orderDate,
            orderCost: orderCost,
            rejectReason: rejectReason
        }

        orderList.push(anOrder);

        for (let i = 0; i < itemPerRestaurant; i++) {
            orderCostCalculated += restaurantItems[i].itemPrice;
            const anOrderItem = {
                orderCode: orderCode,
                itemName: restaurantItems[i].itemName,
                itemPrice: restaurantItems[i].itemPrice,
                itemQuantity: 1,
            }

            orderItemList.push(anOrderItem);
        }
    }

    return ({
        orderList: orderList,
        orderItemList: orderItemList
    })
}

async function batchInsertOrder(dbConnection, orders, orderItems) {
    try {
        // Begin a transaction
        await dbConnection.beginTransaction();

        // Prepare the insert query
        const queryOrder = 
        'INSERT INTO APP_ORDER (customerCode, recipientName, recipientPhone, orderCode, restaurantCode, orderStatus, orderLocation, courierName, courierPhone, orderReview, orderRating, orderDate, orderCost, rejectReason) VALUES ?';

        // Format the data for batch insert
        const valueOrder = 
        orders.map(item => 
            [
                item.customerCode,
                item.recipientName,
                item.recipientPhone,
                item.orderCode,
                item.restaurantCode,
                item.orderStatus,
                item.orderLocation,
                item.courierName,
                item.courierPhone,
                item.orderReview,
                item.orderRating,
                item.orderDate,
                item.orderCost,
                item.rejectReason
            ]);

        // Execute the batch insert query
        await dbConnection.query(queryOrder, [valueOrder]);

        // Prepare the insert query
        const queryOrderItem = 
        'INSERT INTO ORDER_ITEM (orderCode, itemName, itemPrice, itemQuantity) VALUES ?';

        const valueOrderItem = 
        orderItems.map(item => 
            [
                item.orderCode,
                item.itemName,
                item.itemPrice,
                item.itemQuantity
            ]);

        await dbConnection.query(queryOrderItem, [valueOrderItem]);

        console.log('Batch insert order successful');
    } catch (error) {
        // Rollback the transaction if an error occurred
        console.error('Batch insert order failed');
        throw error;
    }
}

function generateCategory(categories) {
    let categoryList = [];
    let categoryRestaurants = [];

    for (let i = 0; i < categories.length; i++) {
        const aCategory = {
            categoryName: categories[i],
            categoryIMG: `${categories[i]}.png`
        }

        const categoryRestaurant = {
            categoryCode: (i+1),
            restaurantCode: (i+1)
        }

        categoryList.push(aCategory);
        categoryRestaurants.push(categoryRestaurant);
    } 

    return ({
        categoryList: categoryList,
        categoryRestaurants: categoryRestaurants
    })
}

async function batchInsertCategory(dbConnection, categories, categoryRestaurant) {
    try {
        // Begin a transaction
        await dbConnection.beginTransaction();

        // Prepare the insert query
        const queryCategory = 
        'INSERT INTO CATEGORY (categoryName, categoryIMG) VALUES ?';

        // Format the data for batch insert
        const valueCategory = 
        categories.map(item => 
            [
                item.categoryName,
                item.categoryIMG
            ]);

        // Execute the batch insert query
        await dbConnection.query(queryCategory, [valueCategory]);

        // Prepare the insert query
        const queryCategoryRestaurant = 
        'INSERT INTO CATEGORY_RESTAURANT (categoryCode, restaurantCode) VALUES ?';

        const valueCategoryRestaurant = 
        categoryRestaurant.map(item => 
            [
                item.categoryCode,
                item.restaurantCode
            ]);

        await dbConnection.query(queryCategoryRestaurant, [valueCategoryRestaurant]);

        console.log('Batch insert category successful');
    } catch (error) {
        // Rollback the transaction if an error occurred
        console.error('Batch insert category failed:');
        throw error;
    }
}

module.exports = 
{
    generateRandomPoints, generateRestaurants, generateRestaurantAuthentications, generateRestaurantItems, batchInsertRestaurant,
    generateCustomers, batchInsertCustomer, generateOrders, batchInsertOrder, generateCategory, batchInsertCategory
}