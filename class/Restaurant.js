const Order = require('./Order.js');
const moment = require('moment-timezone');

class Restaurant {
    constructor(restaurantCode, restaurantEmail, restaurantName, restaurantPhone, restaurantABN, restaurantBanking, restaurantLocation, restaurantLat, restaurantLon, restaurantTotalRating, restaurantTotalOrder, restaurantIMG, isActive) {
        this.restaurantCode = restaurantCode;
        this.restaurantEmail = restaurantEmail;
        this.restaurantName = restaurantName;
        this.restaurantPhone = restaurantPhone;
        this.restaurantABN = restaurantABN;
        this.restaurantBanking = restaurantBanking;
        this.restaurantLocation = restaurantLocation;
        this.restaurantLat = restaurantLat;
        this.restaurantLon = restaurantLon;
        this.restaurantTotalRating = restaurantTotalRating;
        this.restaurantTotalOrder = restaurantTotalOrder;
        this.restaurantIMG = restaurantIMG;
        this.isActive = isActive;
    }

    getInformation() {
        const viewRestaurantABN = "ABN Account Ends With " + this.restaurantABN.slice(-2);
        const viewRestaurantBanking = "Bank Account Ends With " + this.restaurantBanking.slice(-2);

        let restaurantRating = "N/A";
        if (this.restaurantTotalRating !== 0 && this.restaurantTotalOrder !== 0) {
            restaurantRating = (this.restaurantTotalRating / this.restaurantTotalOrder).toFixed(1);
        }

        return ({
            restaurantEmail: this.restaurantEmail,
            restaurantName: this.restaurantName,
            restaurantPhone: this.restaurantPhone,
            restaurantABN: viewRestaurantABN,
            restaurantBanking: viewRestaurantBanking,
            restaurantLocation: this.restaurantLocation,
            restaurantTotalOrder: this.restaurantTotalOrder,
            restaurantRating: restaurantRating
        })
    }

    async setEmail(database, newEmail) {
        try {
            const sql = 'UPDATE RESTAURANT SET restaurantEmail = ? WHERE restaurantCode = ?';
            const sqlValue = [newEmail, this.restaurantCode];

            const updateResult = await database.promise().query(sql, sqlValue);

            const affectedRow = updateResult[0].affectedRows;

            if (affectedRow === 0) {
                return Promise.reject(500);
            }

            return;
        } catch(dbError) {
            console.log("Error When Update Email: " + dbError);
            throw 500;
        }
    }

    async setPassword(database, newPassword) {
        try {
            const sql = 'UPDATE RESTAURANT_AUTHENTICATION SET restaurantPassword = ? WHERE restaurantEmail = ?';
            const sqlValue = [newPassword, this.restaurantEmail];

            const updateResult = await database.promise().query(sql, sqlValue);

            const affectedRow = updateResult[0].affectedRows;

            if (affectedRow === 0) {
                return Promise.reject(500);
            }

            return;
        } catch(dbError) {
            console.log("Error When Update Email: " + dbError);
            throw 500;
        }
    }

    async setPhone(database, newPhone) {
        try {
            const sql = 'UPDATE RESTAURANT SET restaurantPhone = ? WHERE restaurantCode = ?';
            const sqlValue = [newPhone, this.restaurantCode];

            const updateResult = await database.promise().query(sql, sqlValue);

            const affectedRow = updateResult[0].affectedRows;

            if (affectedRow === 0) {
                return Promise.reject(500);
            }

            return;
        } catch(dbError) {
            console.log("Error When Update Email: " + dbError);
            throw 500;
        }
    }

    async addItem(database, itemName, itemPrice) {
        try {
            const sql = 'INSERT INTO RESTAURANT_ITEM VALUES(?, ?, ?, ?)';
            const sqlValue = [this.restaurantCode, itemName, itemPrice, "defaultItem.png"];

            await database.promise().query(sql, sqlValue);

            return 200;
        } catch (dbError) {
            console.log("Error When Adding Item " + dbError);
            if (dbError.code === 'ER_DUP_ENTRY') {
                throw 409;
            }
            throw 500;
        }
    }

    async deleteItem(database, itemName) {
        try {
            const sql = 'DELETE FROM RESTAURANT_ITEM WHERE restaurantCode = ? AND itemName = ?';
            const sqlValue = [this.restaurantCode, itemName];

            const deleteResult = await database.promise().query(sql, sqlValue);

            const affectedRow = deleteResult[0].affectedRows;

            if (affectedRow === 0) {
                return Promise.reject(500);
            }

            return 200;
        } catch (dbError) {
            console.log("Error When Adding Item " + dbError);
            if (dbError.code === 'ER_DUP_ENTRY') {
                throw 409;
            }
            throw 500;
        }
    }

    async editItem(database, itemName, itemPrice, oldItemName) {
        try {
            const sql = 'UPDATE RESTAURANT_ITEM SET itemName = ?, itemPrice = ? WHERE restaurantCode = ? AND itemName = ?';
            
            const sqlValue = [itemName, itemPrice, this.restaurantCode, oldItemName];

            const updateResult = await database.promise().query(sql, sqlValue);

            const affectedRow = updateResult[0].affectedRows;

            if (affectedRow === 0) {
                return Promise.reject(500);
            }

            return 200;
        } catch (dbError) {
            console.log("Error When Adding Item " + dbError);
            if (dbError.code === 'ER_DUP_ENTRY') {
                throw 409;
            }
            throw 500;
        }
    }

    convertDate(dateToConvert) {
        const convertedDate = moment.tz(dateToConvert, 'ddd MMM DD YYYY HH:mm:ss [GMT]Z (z)', 'Australia/Sydney');
        const formattedDate = convertedDate.format('YYYY-MM-DD');
        return formattedDate;
    }

    async getIncomingOrders(database) {
        try {
            const incomingOrders = await Order.getIncomingOrders(database, this.restaurantCode);

            for (let i = 0; i < incomingOrders.length; i++) {
                const orderDate = incomingOrders[i].orderDate;
                const convertedOrderDate = this.convertDate(orderDate);
                incomingOrders[i].orderDate = convertedOrderDate;
            }

            return Promise.resolve(incomingOrders);
        } catch (dbError) {
            console.log("Error While Getting Restaurant Incoming Order: " + dbError);
            throw 500;
        }
    }

    async getActiveOrders(database) {
        try {
            const activeOrders = await Order.getActiveOrders(database, null, this.restaurantCode);

            for (let i = 0; i < activeOrders.length; i++) {
                const orderDate = activeOrders[i].orderDate;
                const convertedOrderDate = this.convertDate(orderDate);
                activeOrders[i].orderDate = convertedOrderDate;
            }

            return Promise.resolve(activeOrders);
        } catch (dbError) {
            console.log("Error While Getting Restaurant Active Order: " + dbError);
            throw 500;
        }
    }

    async getPastOrders(database) {
        try {
            const pastOrders = await Order.getPastOrders(database, null, this.restaurantCode);

            for (let i = 0; i < pastOrders.length; i++) {
                const orderDate = pastOrders[i].orderDate;
                const convertedOrderDate = this.convertDate(orderDate);
                pastOrders[i].orderDate = convertedOrderDate;
            }

            return Promise.resolve(pastOrders);
        }
        catch(dbError) {
            return Promise.reject(dbError);
        }
    }

    async viewOrder(database, orderCode) {
        try {
            const authenticateOrderResult = await Order.authenticateOrder(database, orderCode, null, this.restaurantCode);
            if (authenticateOrderResult.length === 0) {
                return reject(403);
            }

            const authenticatedOrder = authenticateOrderResult[0];

            const anOrder = new 
            Order(
                authenticatedOrder.customerCode,
                authenticatedOrder.recipientName,
                authenticatedOrder.recipientPhone,
                authenticatedOrder.orderCode,
                authenticatedOrder.restaurantCode,
                authenticatedOrder.orderStatus,
                authenticatedOrder.orderLocation,
                authenticatedOrder.courierName,
                authenticatedOrder.courierPhone,
                authenticatedOrder.orderReview,
                authenticatedOrder.orderRating,
                authenticatedOrder.orderDate,
                authenticatedOrder.orderCost,
                authenticatedOrder.rejectReason
            )

            const orderDetail = anOrder.getOrderDetail();
            const orderItems = await anOrder.getOrderItem(database);

            return ({
                oderDetail: orderDetail,
                orderItems: orderItems
            })
        } catch(dbError) {
            console.log("Error When Viewing Order: " + dbError);
            throw dbError;
        }
    }

    async restaurantAcceptOrder(database, orderCode) {
        try {
            const authenticateOrderResult = await Order.authenticateOrder(database, orderCode, null, this.restaurantCode);
            if (authenticateOrderResult.length === 0) {
                return reject(403);
            }

            const authenticatedOrder = authenticateOrderResult[0];

            const anOrder = new 
            Order(
                authenticatedOrder.customerCode,
                authenticatedOrder.recipientName,
                authenticatedOrder.recipientPhone,
                authenticatedOrder.orderCode,
                authenticatedOrder.restaurantCode,
                authenticatedOrder.orderStatus,
                authenticatedOrder.orderLocation,
                authenticatedOrder.courierName,
                authenticatedOrder.courierPhone,
                authenticatedOrder.orderReview,
                authenticatedOrder.orderRating,
                authenticatedOrder.orderDate,
                authenticatedOrder.orderCost,
                authenticatedOrder.rejectReason
            )

            await anOrder.acceptOrder(database, this.restaurantName, this.restaurantPhone);

            return;
        } catch(errorCode) {
            throw errorCode;
        }
    }

    async restaurantRejectOrder(database, orderCode, rejectReason) {
        try {
            const authenticateOrderResult = await Order.authenticateOrder(database, orderCode, null, this.restaurantCode);
            if (authenticateOrderResult.length === 0) {
                return reject(403);
            }

            const authenticatedOrder = authenticateOrderResult[0];

            const anOrder = new 
            Order(
                authenticatedOrder.customerCode,
                authenticatedOrder.recipientName,
                authenticatedOrder.recipientPhone,
                authenticatedOrder.orderCode,
                authenticatedOrder.restaurantCode,
                authenticatedOrder.orderStatus,
                authenticatedOrder.orderLocation,
                authenticatedOrder.courierName,
                authenticatedOrder.courierPhone,
                authenticatedOrder.orderReview,
                authenticatedOrder.orderRating,
                authenticatedOrder.orderDate,
                authenticatedOrder.orderCost,
                authenticatedOrder.rejectReason
            )

            await anOrder.rejectOrder(database, rejectReason);

            return;
        } catch(errorCode) {
            throw errorCode;
        }
    }

    async viewRevenueStatus(database, startDate, endDate) {
        try {
            const orders = await Order.getOrdersByTimeline(database, this.restaurantCode, startDate, endDate);

            let totalRevenue = 0;
            const completedOrders = orders.length;

            for (let i = 0; i < completedOrders; i++) {
                totalRevenue += parseFloat(orders[i].orderCost)
            }

            return ({
                completedOrders: completedOrders,
                totalRevenue: totalRevenue
            })
        } catch(errorCode) {
            throw errorCode;
        }
    }

    static async registerOwner(database, restaurantEmail, restaurantName, restaurantPhone, restaurantABN, restaurantBanking, restaurantLocation, restaurantLat, restaurantLon, categories) {
        let databaseConnection = null;
        try {
            databaseConnection = await database.promise().getConnection();

            await databaseConnection.beginTransaction();

            const sql = 
            'INSERT INTO RESTAURANT \
            (restaurantEmail, restaurantName, restaurantPhone, restaurantABN, restaurantBanking, restaurantLocation, restaurantLat, restaurantLon, restaurantTotalRating, restaurantTotalOrder, restaurantIMG, isActive) \
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
            const sqlValue = [restaurantEmail, restaurantName, restaurantPhone, restaurantABN, restaurantBanking, restaurantLocation, restaurantLat, restaurantLon, 0, 0, "defaultRestaurant.png", true]

            const insertResult = await databaseConnection.query(sql, sqlValue);

            const restaurantCode = insertResult[0].insertId;

            for (let i = 0; i < categories.length; i++) {
                const categoryCode = parseInt(categories[i]);
                const sqlCategoryRestaurant = 'INSERT INTO CATEGORY_RESTAURANT VALUES(?, ?)';
                const sqlCategoryRestaurantValue = [categoryCode, restaurantCode];
                await databaseConnection.query(sqlCategoryRestaurant, sqlCategoryRestaurantValue);
            }

            await databaseConnection.commit();

            return restaurantCode;
        }
        catch(dbError) {
            console.log(dbError);
            await databaseConnection.rollback();
            if (dbError.code === 'ER_DUP_ENTRY') {
                throw 409;
            }
            throw 500;
        } finally {
            if (databaseConnection !== null) {
                databaseConnection.release();
            }
        }
    }

    static async authenticateOwner(database, inputEmail, inputPassword) {
        try {
            const sql = 
            'SELECT RESTAURANT.restaurantCode, RESTAURANT.restaurantEmail, RESTAURANT.restaurantName, RESTAURANT.restaurantPhone, \
            RESTAURANT.restaurantABN, \RESTAURANT.restaurantBanking, RESTAURANT.restaurantLocation, \
            RESTAURANT.restaurantLat, RESTAURANT.restaurantLon, RESTAURANT.restaurantTotalRating, \
            RESTAURANT.restaurantTotalOrder, RESTAURANT.restaurantIMG, RESTAURANT.isActive \
            FROM RESTAURANT JOIN RESTAURANT_AUTHENTICATION \
            ON RESTAURANT.restaurantEmail = RESTAURANT_AUTHENTICATION.restaurantEmail \
            WHERE RESTAURANT_AUTHENTICATION.restaurantEmail = ? AND RESTAURANT_AUTHENTICATION.restaurantPassword = ?';

            const sqlValue = [inputEmail, inputPassword];

            const queryResult = await database.promise().query(sql, sqlValue);

            const owners = queryResult[0];

            if (owners.length === 0) {
                return Promise.reject(401);
            }

            return owners[0];
        } catch (dbError) {
            console.log("Error During Restaurant Authentication: " + dbError);
            throw 500;
        }
    }

    static async getRestaurantItems(database, restaurantName) {
        try {
            const sql = 
            "SELECT RESTAURANT_ITEM.restaurantCode, RESTAURANT_ITEM.itemName, RESTAURANT_ITEM.itemPrice, RESTAURANT_ITEM.itemIMG\
            FROM RESTAURANT JOIN RESTAURANT_ITEM \
            ON RESTAURANT.restaurantCode = RESTAURANT_ITEM.restaurantCode \
            WHERE RESTAURANT.restaurantName = ?";
            const sqlValue = [restaurantName];

            const result = await database.promise().query(sql, sqlValue);
            const itemList = result[0];

            return Promise.resolve(itemList);
        }
        catch(dbError) {
            console.log(dbError);
            return Promise.reject(500);
        }
    }

    static async getRestaurantPublicDetail(database, restaurantName) {
        try {
            const sql = 
            "SELECT restaurantName, restaurantLocation, restaurantIMG,\
            NULLIF(ROUND((restaurantTotalRating / NULLIF(restaurantTotalOrder, 0)), 2), 0) AS rating \
            FROM RESTAURANT WHERE restaurantName = ?";
            const sqlValue = [restaurantName];

            const result = await database.promise().query(sql, sqlValue);
            const restaurantList = result[0];

            if (restaurantList.length === 0) {
                return Promise.reject(404);
            }
            return Promise.resolve(restaurantList[0]);
        }
        catch(dbError) {
            console.log(dbError);
            return Promise.reject(500);
        }
    }

    static toRadians(degrees) {
        return degrees * Math.PI / 180;
    }
      
    static haversine(lat1, lon1, lat2, lon2) {
        
        // Radius of the Earth in kilometers
        const R = 6371.0;
        
        // Convert latitude and longitude from degrees to radians
        const lat1Rad = Restaurant.toRadians(lat1);
        const lon1Rad = Restaurant.toRadians(lon1);
        const lat2Rad = Restaurant.toRadians(lat2);
        const lon2Rad = Restaurant.toRadians(lon2);
        
        // Haversine formula
        const dLon = lon2Rad - lon1Rad;
        const dLat = lat2Rad - lat1Rad;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        
        return distance;
    }
    
    static filterRestaurantByDistance(dbRestaurants, cusLat, cusLon, radius) {
        let distanceFilteredRestaurants = []
        for (let i = 0; i < dbRestaurants.length; i++) {
          let dbLat = dbRestaurants[i].restaurantLat;
          let dbLon = dbRestaurants[i].restaurantLon;
          let distance = Restaurant.haversine(cusLat, cusLon, dbLat, dbLon);
          if (distance < radius) {
            distanceFilteredRestaurants.push(dbRestaurants[i]);
          }
        }
      
        return distanceFilteredRestaurants;
    }

    static getRestaurantByKeyword(database, keyword, ratingLowerBound) {
        return new Promise((resolve,reject) => {
            let sql = 
            'SELECT restaurantCode, restaurantName, restaurantLocation, restaurantLat, restaurantLon,\
            NULLIF(ROUND((restaurantTotalRating / NULLIF(restaurantTotalOrder, 0)), 2), 0) AS rating\
            FROM RESTAURANT WHERE isActive = true AND restaurantName LIKE ?'

            let sqlValue = [`%${keyword}%`];

            if (ratingLowerBound !== undefined) {
                sql += ' AND (restaurantTotalRating / NULLIF(restaurantTotalOrder, 0)) > ?';
                sqlValue.push(parseInt(ratingLowerBound));
            }

            database.query(sql, sqlValue, (dbError, result) => {
                if (dbError) {
                    console.log(dbError);
                    return reject(500);
                }

                resolve(result);
            })
        })
    }

    static getCategories(database) {
        return new Promise((resolve, reject) => {
            const sql = 'SELECT * FROM CATEGORY';
            const queryValue = [];

            database.query(sql, queryValue, (dbError, result) => {
                if (dbError) {
                    console.log(dbError);
                    return reject(500);
                }

                resolve(result);
            })
        })
    }

    static getRestaurantByCategory(database, category, ratingLowerBound) {
        return new Promise((resolve,reject) => {
            let sql = 
            'SELECT RESTAURANT.restaurantCode, RESTAURANT.restaurantName, RESTAURANT.restaurantLocation,\
            RESTAURANT.restaurantLat, RESTAURANT.restaurantLon,\
            NULLIF(ROUND((restaurantTotalRating / NULLIF(restaurantTotalOrder, 0)), 2), 0) AS rating\
            FROM CATEGORY\
            JOIN CATEGORY_RESTAURANT ON CATEGORY.categoryCode = CATEGORY_RESTAURANT.categoryCode\
            JOIN RESTAURANT ON CATEGORY_RESTAURANT.restaurantCode = RESTAURANT.restaurantCode\
            WHERE RESTAURANT.isActive = true AND CATEGORY.categoryName = ?'; 
 
            let sqlValue = [category];

            if (ratingLowerBound !== undefined) {
                sql += ' AND (restaurantTotalRating / NULLIF(restaurantTotalOrder, 0)) > ?';
                sqlValue.push(parseInt(ratingLowerBound));
            }

            database.query(sql, sqlValue, (dbError, result) => {
                if (dbError) {
                    console.log(dbError);
                    return reject(500);
                }

                resolve(result);
            })
        })
    }
}

module.exports = Restaurant;