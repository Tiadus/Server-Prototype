const moment = require('moment-timezone');

class Order {
    constructor(customerCode, recipientName, recipientPhone, orderCode, restaurantCode, orderStatus, 
        orderLocation, courierName, courierPhone, orderReview, orderRating, orderDate, orderCost, rejectReason) {
        this.customerCode = customerCode;
        this.recipientName = recipientName;
        this.recipientPhone = recipientPhone;
        this.orderCode = orderCode;
        this.restaurantCode = restaurantCode;
        this.orderStatus = orderStatus;
        this.orderLocation = orderLocation;
        this.courierName = courierName;
        this.courierPhone = courierPhone;
        this.orderReview = orderReview;
        this.orderRating = orderRating;
        this.rejectReason = rejectReason;

        const convertedDate = moment.tz(orderDate, 'ddd MMM DD YYYY HH:mm:ss [GMT]Z (z)', 'Australia/Sydney');
        const formattedDate = convertedDate.format('YYYY-MM-DD');

        this.orderDate = formattedDate;
        this.orderCost = orderCost;
    }

    getOrderDetail() {
        const orderDetail = {
            customerCode: this.customerCode,
            recipientName: this.recipientName,
            recipientPhone: this.recipientPhone,
            orderCode: this.orderCode,
            restaurantCode: this.restaurantCode,
            orderStatus: this.orderStatus,
            orderLocation: this.orderLocation,
            courierName: this.courierName,
            courierPhone: this.courierPhone,
            orderReview: this.orderReview,
            orderRating: this.orderRating,
            orderDate: this.orderDate,
            orderCost: this.orderCost,
            rejectReason: this.rejectReason
        }

        return orderDetail;
    }

    getOrderItem(database) {
        return new Promise((resolve, reject) => {
            const sql = 
            'SELECT RESTAURANT_ITEM.restaurantCode, RESTAURANT_ITEM.itemName, ORDER_ITEM.itemPrice, ORDER_ITEM.itemQuantity, \
            ROUND((ORDER_ITEM.itemPrice * ORDER_ITEM.itemQuantity),2) AS totalUnitPrice, RESTAURANT_ITEM.itemIMG \
            FROM ORDER_ITEM \
            JOIN APP_ORDER ON ORDER_ITEM.orderCode = APP_ORDER.orderCode \
            JOIN RESTAURANT_ITEM ON APP_ORDER.restaurantCode = RESTAURANT_ITEM.restaurantCode AND ORDER_ITEM.itemName = RESTAURANT_ITEM.itemName \
            WHERE ORDER_ITEM.orderCode = ?';
            const sqlValue = [this.orderCode];

            database.query(sql, sqlValue, (dbError, result) => {
                if (dbError) {
                    console.log(dbError);
                    return reject(500);
                }

                resolve(result);
            })
        })
    }

    async setRatingReview(database, orderRating, orderReview) {
        if (this.orderStatus !== 2) {
            return Promise.reject(403);
        }

        try {
            const connection = await database.promise().getConnection();
            await connection.beginTransaction();

            const sql1 = 'UPDATE APP_ORDER SET orderStatus = ?, orderRating = ?, orderReview = ? WHERE orderCode = ?';
            const sqlValue1 = [3, orderRating, orderReview, this.orderCode];
            const sql2 = 
            'UPDATE RESTAURANT \
            SET restaurantTotalRating = restaurantTotalRating + ?, restaurantTotalOrder = restaurantTotalOrder + 1\
            WHERE restaurantCode = ?';
            const sqlValue2 = [orderRating, this.restaurantCode];

            await connection.query(sql1, sqlValue1);
            await connection.query(sql2, sqlValue2);
            await connection.commit();
            await connection.release();

            return Promise.resolve();
        }
        catch (dbError) {
            console.log(dbError);
            return Promise.reject(500);
        }
    }

    async reportOrder(database) {
        if (this.orderStatus !== 2) {
            return Promise.reject(403);
        }

        try {
            const sql = 'UPDATE APP_ORDER SET orderStatus = ? WHERE orderCode = ?';
            const sqlValue = [4, this.orderCode];
            const dbResult = await database.promise().query(sql, sqlValue);

            return Promise.resolve();
        }
        catch (dbError) {
            return Promise.reject(500);
        }
    }

    async deleteOrder(database) {
        if (this.orderStatus !== 1) {
            return Promise.reject(403);
        }

        try {
            const sql = 'DELETE FROM APP_ORDER WHERE orderCode = ?';
            const sqlValue = [this.orderCode];
            const dbResult = await database.promise().query(sql, sqlValue);

            return Promise.resolve();
        }
        catch (dbError) {
            return Promise.reject(500);
        }
    }

    async acceptOrder(database, restaurantName, restaurantPhone) {
        if (this.orderStatus !== 1) {
            return Promise.reject(403);
        }

        try {
            const sql = 'UPDATE APP_ORDER SET orderStatus = 2, courierName = ?, courierPhone = ? WHERE orderCode = ?';
            const sqlValue = [(restaurantName + " Courier"), restaurantPhone, this.orderCode];

            const updateResult = await database.promise().query(sql, sqlValue);

            const affectedRow = updateResult[0].affectedRows;

            if (affectedRow === 0) {
                throw "No Row Updated!";
            }
        } catch(dbError) {
            console.log("Error When Accepting Order: " + dbError);
            throw 500;
        }
    }

    async rejectOrder(database, rejectReason) {
        if (this.orderStatus !== 1) {
            return Promise.reject(403);
        }

        try {
            const sql = 'UPDATE APP_ORDER SET orderStatus = 0, rejectReason = ? WHERE orderCode = ?';
            const sqlValue = [rejectReason, this.orderCode];

            const updateResult = await database.promise().query(sql, sqlValue);

            const affectedRow = updateResult[0].affectedRows;

            if (affectedRow === 0) {
                throw "No Row Updated!";
            }
        } catch(dbError) {
            console.log("Error When Accepting Order: " + dbError);
            throw 500;
        }
    }


    static authenticateOrder(database, orderCode, customerCode, restaurantCode) {
        return new Promise((resolve,reject) => {
            let sql = "SELECT * FROM APP_ORDER WHERE orderCode = ?";
            let sqlValue = [orderCode];

            if (restaurantCode === null) {
                sql += " AND customerCode = ?";
                sqlValue.push(customerCode);
            }

            if (customerCode === null) {
                sql += " AND restaurantCode = ?";
                sqlValue.push(restaurantCode);
            }

            database.query(sql, sqlValue, (dbError,result) => {
                if (dbError) {
                    console.log(dbError);
                    return reject(500);
                }

                resolve(result);
            })
        })
    }

    static getServerOrderTime() {
        // Get the current date and time
        const currentDate = new Date();

        // Extract date and time components
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Adding 1 because getMonth() returns zero-based month
        const day = String(currentDate.getDate()).padStart(2, '0');
        const hour = String(currentDate.getHours()).padStart(2, '0');
        const minute = String(currentDate.getMinutes()).padStart(2, '0');
        const second = String(currentDate.getSeconds()).padStart(2, '0');

        return [year, month, day, hour, minute, second];
    }

    static createOrderCode(customerCode, restaurantCode) {
        const timeInfo = this.getServerOrderTime();

        // Create the formatted string
        let formattedDateTime = `${timeInfo[0]}${timeInfo[1]}${timeInfo[2]}${timeInfo[3]}${timeInfo[4]}${timeInfo[5]}`;

        const orderCode = "O" + "C" + customerCode + "R" + restaurantCode + "T" + formattedDateTime;
        return orderCode;
    }

    static async createOrder(database, cartCode, customerCode, recipientName, recipientPhone, orderCode, restaurantCode, orderLocation, orderDate, orderCost) {
            database.promise().getConnection()
            .then(async function(connection) {
                try {
                    await connection.beginTransaction();

                    const sql1 = 'INSERT INTO APP_ORDER VALUES(?,?,?,?,?,?,?,null,null,null,null,?,?,null)';
                    const sqlValue1 = [customerCode, recipientName, recipientPhone, orderCode, restaurantCode, 1, orderLocation, orderDate, orderCost];

                    const sql2 = 
                    'INSERT INTO ORDER_ITEM(orderCode, itemName, itemPrice, itemQuantity)\
                    SELECT ?, CART_ITEM.itemName, CART_ITEM.itemPrice, CART_ITEM.itemQuantity\
                    FROM CART_ITEM WHERE cartCode = ?'
                    const sqlValue2 = [orderCode, cartCode];

                    const sql3 = 'DELETE FROM CUSTOMER_CART WHERE cartCode = ?'
                    const sqlValue3 = [cartCode];

                    await connection.query(sql1, sqlValue1);
                    await connection.query(sql2, sqlValue2);
                    await connection.query(sql3, sqlValue3);

                    await connection.commit();

                    await connection.release();
                    
                    return 0;
                } catch (dbError) {
                    await connection.rollback();
                    console.log(dbError);
                    throw 500;
                }
            }).catch(errorCode => {
                return Promise.reject(errorCode);
            })
    }

    static async getIncomingOrders(database, restaurantCode) {
        try {
            let sql = "SELECT * FROM APP_ORDER WHERE restaurantCode = ? AND orderStatus IN (1)";
            let sqlValue = [restaurantCode];

            const result = await database.promise().query(sql, sqlValue);

            return Promise.resolve(result[0]);
        }
        catch (dbError) {
            console.log(dbError);
            return Promise.reject(500);
        }
    }

    static async getActiveOrders(database, customerCode, restaurantCode) {
        try {
            let sql = "SELECT * FROM APP_ORDER";
            let sqlValue = [];
    
            if (restaurantCode === null) {
                sql += " WHERE customerCode = ? AND orderStatus IN (1,2)";
                sqlValue.push(customerCode);
            }
    
            if (customerCode === null) {
                sql += " WHERE restaurantCode = ? AND orderStatus IN (2)";
                sqlValue.push(restaurantCode);
            }

            const result = await database.promise().query(sql, sqlValue);

            return Promise.resolve(result[0]);
        }
        catch (dbError) {
            console.log(dbError);
            return Promise.reject(500);
        }
    }

    static async getPastOrders(database, customerCode, restaurantCode) {
        try {
            let sql = "SELECT * FROM APP_ORDER";
            let sqlValue = [];
    
            if (restaurantCode === null) {
                sql += " WHERE customerCode = ? AND orderStatus IN (0, 3, 4)";
                sqlValue.push(customerCode);
            }
    
            if (customerCode === null) {
                sql += " WHERE restaurantCode = ? AND orderStatus IN (3, 4)";
                sqlValue.push(restaurantCode);
            }

            const result = await database.promise().query(sql, sqlValue);

            return Promise.resolve(result[0]);
        }
        catch (dbError) {
            console.log(dbError);
            return Promise.reject(500);
        }
    }

    static async getOrdersByTimeline(database, restaurantCode, startDate, endDate) {
        try {   
            const sql = 
            "SELECT * FROM APP_ORDER WHERE restaurantCode = ? AND orderStatus = 3 \
            AND orderDate >= ? AND orderDate <= ?";
            const sqlValue = [restaurantCode, startDate, endDate];

            const queryResult = await database.promise().query(sql, sqlValue);

            return queryResult[0];
        } catch(dbError) {
            console.log("Error When Getting Order By Timeline");
            throw 500;
        }
    }
}

module.exports = Order;