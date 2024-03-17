const Cart = require('./Cart.js');
const Restaurant = require('./Restaurant.js');
const Order = require('./Order.js');
const moment = require('moment-timezone');

class Customer {
    constructor(customerCode, customerEmail, customerName, membershipEnd) {
        this.customerCode = customerCode;
        this.customerEmail = customerEmail;
        this.customerName = customerName;

        let formattedDate = null;

        if (membershipEnd !== null) {
            const convertedDate = moment.tz(membershipEnd, 'ddd MMM DD YYYY HH:mm:ss [GMT]Z (z)', 'Australia/Sydney');
            formattedDate = convertedDate.format('YYYY-MM-DD');
        }

        this.membershipEnd = formattedDate;
    }

    static async registerCustomer(database, customerEmail, customerName, customerPhone, customerPassword) {
        let databaseConnection = null;
        try {
            databaseConnection = await database.promise().getConnection();
            await databaseConnection.beginTransaction();

            const sqlRegisterCustomer = 'INSERT INTO CUSTOMER (customerEmail, customerName, customerPhone, membershipEnd, isActive) VALUES(?, ?, ?, ?, ?)';
            const sqlRegisterCustomerValue = [customerEmail, customerName, customerPhone, null, true];
            const customerRegisterResult = await databaseConnection.query(sqlRegisterCustomer, sqlRegisterCustomerValue);

            const sqlRegisterAuthentication = 'INSERT INTO CUSTOMER_AUTHENTICATION (customerEmail, customerPassword) VALUES(?, ?)'
            const sqlRegisterAuthenticationValue = [customerEmail, customerPassword];
            await databaseConnection.query(sqlRegisterAuthentication, sqlRegisterAuthenticationValue);
            
            databaseConnection.commit();
            databaseConnection = null;

            return customerRegisterResult[0].insertId;
        } catch(dbError) {
            console.log("Error Occur During Customer Registration: " + dbError);
            if (databaseConnection !== null) {
                databaseConnection.rollback();
            }
            throw 500;
        } finally {
            if (databaseConnection !== null) {
                databaseConnection.release();
            }
        }
    }

    static authenticateCustomer(database, inputEmail, inputPassword) {
        return new Promise((resolve,reject) => {
            const sql = 
            "SELECT CUSTOMER.customerCode, CUSTOMER.customerEmail, CUSTOMER.customerName, CUSTOMER.membershipEnd, CUSTOMER_CART.cartCode \
            FROM CUSTOMER JOIN CUSTOMER_AUTHENTICATION \
            ON CUSTOMER.customerEmail = CUSTOMER_AUTHENTICATION.customerEmail \
            LEFT JOIN CUSTOMER_CART ON CUSTOMER.customerCode = CUSTOMER_CART.customerCode \
            WHERE CUSTOMER_AUTHENTICATION.customerEmail = ? AND CUSTOMER_AUTHENTICATION.customerPassword = ?";
    
            const sqlValue = [inputEmail, inputPassword];
    
            database.query(sql, sqlValue, (dbError, result) => {
                if (dbError) {
                    console.log(dbError)
                    return reject(500);
                }

                if (result.length === 0) {
                    return reject(401);
                }

                resolve(result);
            })
        })
    }

    async customerLogin(database) {
        let totalItemInCart = 0;
        try {
            const fetchCartResult = await Cart.authenticateCart(database, this.customerCode);
            
            if (fetchCartResult.length === 0) {
                return totalItemInCart;
            }

            const fetchedCart = fetchCartResult[0];
            const restaurantCode = fetchedCart.restaurantCode;
            const cartCode = fetchedCart.cartCode;

            const aCart = new Cart(cartCode);

            const itemInCart = await aCart.getItem(database, null);

            for (let i = 0; i < itemInCart.length; i++) {
                totalItemInCart += itemInCart[i].itemQuantity;
            }

            return totalItemInCart;
        } catch(dbError) {
            console.log("Error Occurs When Logging In Customer: " + dbError);
            throw 500;
        }
    }

    getInformation() {
        return ({
            customerCode: this.customerCode,
            customerEmail: this.customerEmail,
            customerName: this.customerName,
            membershipEnd: this.membershipEnd
        })
    }

    async setEmail(database, newEmail) {
        try {
            const sql = 'UPDATE CUSTOMER SET customerEmail = ? WHERE customerCode = ?';
            const sqlValue = [newEmail, this.customerCode];

            const dbResult = await database.promise().query(sql, sqlValue);

            if (dbResult[0].affectedRows === 0) {
                return Promise.reject(403);
            }

            return Promise.resolve();
        }
        catch(dbError) {
            console.log(dbError);
            return Promise.reject(parseInt(dbError.sqlState));
        }
    }

    async setPhone(database, newPhone) {
        try {
            const sql = 'UPDATE CUSTOMER SET customerPhone = ? WHERE customerCode = ?';
            const sqlValue = [newPhone, this.customerCode];

            const dbResult = await database.promise().query(sql, sqlValue);

            if (dbResult[0].affectedRows === 0) {
                return Promise.reject(403);
            }

            return Promise.resolve();
        }
        catch(dbError) {
            console.log(dbError);
            return Promise.reject(parseInt(dbError.sqlState));
        }
    }

    async setPassword(database, newPassword) {
        try {
            const sql = 'UPDATE CUSTOMER_AUTHENTICATION SET customerPassword = ? WHERE customerEmail = ?';
            const sqlValue = [newPassword, this.customerEmail];

            const dbResult = await database.promise().query(sql, sqlValue);

            if (dbResult[0].affectedRows === 0) {
                return Promise.reject(403);
            }

            return Promise.resolve();
        }
        catch(dbError) {
            console.log(dbError);
            return Promise.reject(parseInt(dbError.sqlState));
        }
    }

    getExtendedDate(extensionType) {
        let currentMembership;
        let currentDate = new Date();

        if (this.membershipEnd !== null) {
            currentMembership = new Date(this.membershipEnd);
            if (currentMembership < currentDate) {
                currentMembership = currentDate;
            }
        }

        if (this.membershipEnd === null) {
            currentMembership = currentDate;
        }

        switch(extensionType) {
            case 0:
                currentMembership.setMonth(currentMembership.getMonth()+1);
                break;
            case 1:
                currentMembership.setFullYear(currentMembership.getFullYear() + 1);
                break;
            default:
                currentMembership = new Date('2024-09-01');
        }

        const extendedDate = currentMembership;

        return extendedDate.toISOString().split('T')[0];
    }

    async extendMembership(database, extensionType) {
        let databaseConnection = null;

        try {
            databaseConnection = await database.promise().getConnection();
            const newMembershipDate = this.getExtendedDate(extensionType);
            
            const sql = "UPDATE CUSTOMER SET membershipEnd = ? WHERE customerCode = ?";
            const sqlValue = [newMembershipDate, this.customerCode];

            const updateResult = await databaseConnection.query(sql, sqlValue);

            if (updateResult[0].affectedRows === 0) {
                console.log("No Row Updated");
                throw 500;
            }

            return 200;
        } catch(dbError) {
            console.log(dbError);
            throw 500;
        } finally {
            if (databaseConnection !== null) {
                databaseConnection.release();
            }
        }
    }

    async getPaymentMethods(database) {
        try {
            const sql = 'SELECT paymentCode, cardNumber FROM CUSTOMER_PAYMENT WHERE customerCode = ?';
            const sqlValue = [this.customerCode];

            const dbResult = await database.promise().query(sql, sqlValue);
            let customerPaymentMethods = dbResult[0];

            for (let i = 0; i < customerPaymentMethods.length; i++) {
                let encryptedCardNumber = "Card Ends With " + customerPaymentMethods[i].cardNumber.slice(-2);
                customerPaymentMethods[i].cardNumber = encryptedCardNumber;
            }

            return customerPaymentMethods;
        } catch (dbError) {
            console.log(dbError);
            throw 500;
        }
    }

    async addPaymentMethods(database, cardNumber, cardOwner, cardExpMonth, cardExpYear) {
        let databaseConnection = null;
        try {
            databaseConnection = await database.promise().getConnection();

            const sql = 'INSERT INTO CUSTOMER_PAYMENT (customerCode, cardNumber, cardOwner, cardExpMonth, cardExpYear) VALUES (?, ?, ?, ?, ?)';
            const sqlValue = [this.customerCode, cardNumber, cardOwner, cardExpMonth, cardExpYear];

            const insertResult = await databaseConnection.query(sql, sqlValue);

            if (insertResult[0].affectedRows === 0) {
                console.log("No Row Updated");
                throw 500;
            }

        } catch (dbError) {
            if (databaseConnection !== null) {
                databaseConnection.rollback();
            }
            console.log(dbError);
            throw 500;
        } finally {
            if (databaseConnection !== null) {
                databaseConnection.release();
            }
        }
    }

    async deletePaymentMethods(database, paymentCode) {
        let databaseConnection = null;
        try {
            databaseConnection = await database.promise().getConnection();

            const sql = 'DELETE FROM CUSTOMER_PAYMENT WHERE paymentCode = ? AND customerCode = ?';
            const sqlValue = [paymentCode, this.customerCode];

            const deleteResult = await databaseConnection.query(sql, sqlValue);

            if (deleteResult[0].affectedRows === 0) {
                console.log("No Row Updated");
                throw 500;
            }

        } catch (dbError) {
            if (databaseConnection !== null) {
                databaseConnection.rollback();
            }
            console.log(dbError);
            throw 500;
        } finally {
            if (databaseConnection !== null) {
                databaseConnection.release();
            }
        }
    }

    displayCart(database, cusLat, cusLon) {
        return new Promise((resolve, reject) => {
            const fetchCartPromise = Cart.authenticateCart(database, this.customerCode);
            fetchCartPromise
            .then(result => {
                if (result.length === 0) {
                    return reject(404);
                }
    
                if (result.length > 0) {
                    const aCart = new Cart(result[0].cartCode);
                    const getCartInformationPromise = Promise.all([
                        aCart.getItem(database, null),
                        aCart.viewRestaurant(database)
                    ]);
                    getCartInformationPromise
                    .then(results => {
                        const dbItemList = results[0];
                        const dbRestaurantInformation = results[1];

                        let totalItemCost = 0;
                        for (let i = 0; i < dbItemList.length; i++) {
                            totalItemCost += parseFloat(dbItemList[i].totalUnitPrice);
                        }

                        const restaurantLat = dbRestaurantInformation[0].restaurantLat;
                        const restaurantLon = dbRestaurantInformation[0].restaurantLon;
                        const distance = Restaurant.haversine(cusLat, cusLon, restaurantLat, restaurantLon);
                        const deliveryCost = distance * 2;
                        let discountPercentage = 0;

                        const currentDate = new Date();

                        if (this.membershipEnd !== null) {
                            const dbDate = new Date(this.membershipEnd);
                            if (currentDate.getTime() < dbDate.getTime()) {
                                discountPercentage = 0.2;
                            }
                        }

                        const orderCost = totalItemCost + deliveryCost;
                        const finalCost = orderCost - orderCost * discountPercentage;

                        let returnResult = {
                            restaurantCode: dbRestaurantInformation[0].restaurantCode,
                            restaurantName: dbRestaurantInformation[0].restaurantName,
                            items: dbItemList,
                            costs: {
                                deliveryCost: deliveryCost.toFixed(2),
                                totalItemCost: totalItemCost.toFixed(2),
                                oderCost: orderCost.toFixed(2),
                                discountPercentage: (discountPercentage * 100),
                                finalCost: finalCost.toFixed(2)
                            }
                        }

                        resolve(returnResult);
                    })
                    .catch(errorCode => {
                        return reject(errorCode);
                    })
                }
            })
        })
    }

    addItemToCart(database, restaurantCode, itemName, itemPrice, itemQuantity) {
        return new Promise((resolve, reject) => {
            const fetchCartPromise = Cart.authenticateCart(database, this.customerCode);
            fetchCartPromise
            .then(result => {
                if (result.length === 0) {
                    const cartCode = Cart.createCartCode(this.customerCode, restaurantCode);
                    const insertCartPromise = Cart.insertCart(database, this.customerCode, restaurantCode, cartCode);
                    insertCartPromise
                    .then(insertCartResult => {
                        const aCart = new Cart(cartCode);
                        const addItemPromise = aCart.addItem(database, itemName, itemPrice, itemQuantity);
                        addItemPromise
                        .then(addItemResult => {
                            aCart.getItem(database, null)
                            .then(itemInCart => {
                                let totalItemInCart = 0
                                for (let i = 0; i < itemInCart.length; i++) {
                                    totalItemInCart += itemInCart[i].itemQuantity;
                                }

                                resolve(totalItemInCart);
                            })
                        })
                        .catch(errorCode => {
                            return reject(errorCode);
                        })
                    })
                    .catch(errorCode => {
                        return reject(errorCode);
                    })
                }
    
                if (result.length > 0) {
                    if (result[0].restaurantCode !== restaurantCode) {
                        console.log(result[0].restaurantCode);
                        console.log(restaurantCode);
                        return reject(690);
                    }
    
                    const aCart = new Cart(result[0].cartCode);
                    const addItemPromise = aCart.addItem(database, itemName, itemPrice, itemQuantity);
                    addItemPromise
                    .then(addItemResult => {
                        aCart.getItem(database, null)
                        .then(itemInCart => {
                            let totalItemInCart = 0
                            for (let i = 0; i < itemInCart.length; i++) {
                                totalItemInCart += itemInCart[i].itemQuantity;
                            }

                            resolve(totalItemInCart);
                        })
                    })
                    .catch(errorCode => {
                        return reject(errorCode);
                    })
                }
            })
        })
    }

    modifyItemInCart(database, itemName, itemQuantity) {
        return new Promise((resolve, reject) => {
            const fetchCartPromise = Cart.authenticateCart(database, this.customerCode);
            fetchCartPromise
            .then(result => {
                if (result.length === 0) {
                    return reject(404);
                }
    
                if (result.length > 0) {
                    if (result[0].customerCode !== this.customerCode) {
                        return reject(403);
                    }

                    const aCart = new Cart(result[0].cartCode);
                    const modifyItemPromise = aCart.modifyItem(database, itemName, itemQuantity);
                    modifyItemPromise
                    .then(result => {
                        aCart.getItem(database, null)
                        .then(itemInCart => {
                            let totalItemInCart = 0
                            for (let i = 0; i < itemInCart.length; i++) {
                                totalItemInCart += itemInCart[i].itemQuantity;
                            }

                            resolve(totalItemInCart);
                        })
                    })
                    .catch(errorCode => {
                        return reject(errorCode);
                    })
                }
            })
        })
    }

    customerDeleteCart(database) {
        return new Promise((resolve, reject) => {
            const fetchCartPromise = Cart.authenticateCart(database, this.customerCode);
            fetchCartPromise
            .then(result => {
                if (result.length === 0) {
                    return reject(404);
                }
    
                if (result.length > 0) {
                    if (result[0].customerCode !== this.customerCode) {
                        return reject(403);
                    }

                    const cartCode = result[0].cartCode;

                    const aCart = new Cart(cartCode);
                    aCart.deleteCart(database, this.customerCode)
                    .then(() => {
                        resolve();
                    })
                    .catch(errorCode => {
                        return reject(errorCode);
                    })
                }
            })
            .catch(errorCode => {
                return reject(errorCode);
            })
        })
    }

    createCustomerOrder(database, recipientName, recipientPhone, orderLocation, orderCost) {
        return new Promise((resolve, reject) => {
            const fetchCartPromise = Cart.authenticateCart(database, this.customerCode);
            fetchCartPromise
            .then(result => {
                if (result.length === 0) {
                    return reject(404);
                }
    
                if (result.length > 0) {
                    if (result[0].customerCode !== this.customerCode) {
                        return reject(403);
                    }

                    const cartCode = result[0].cartCode;
                    const restaurantCode = result[0].restaurantCode;

                    const aCart = new Cart(cartCode);
                    aCart.getItem(database, null)
                    .then(result => {
                        const orderCode = Order.createOrderCode(this.customerCode, restaurantCode);
                        const timeInfo = Order.getServerOrderTime();
                        const dateInfo = [timeInfo[0], timeInfo[1], timeInfo[2]];
                        const orderDate = dateInfo.join("-");

                        Order.createOrder(database, cartCode, this.customerCode, recipientName, recipientPhone, orderCode, restaurantCode, orderLocation, orderDate, orderCost)
                        .then(() => {resolve();})
                        .catch(errorCode => {
                            return reject(errorCode);
                        })
                    })
                    .catch(errorCode => {
                        return reject(errorCode);
                    })
                }
            })
            .catch(errorCode => {
                return reject(errorCode);
            })
        })
    }

    customerViewOrder(database, orderCode) {
        return new Promise((resolve,reject) => {
            Order.authenticateOrder(database, orderCode, this.customerCode, null)
            .then(result => {
                if (result.length === 0) {
                    return reject(403);
                }

                const authenticatedOrder = result[0];

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
                const getOrderItemPromise = anOrder.getOrderItem(database);
                getOrderItemPromise
                .then(result => {
                    const orderView = {
                        oderDetail: orderDetail,
                        orderItems: result
                    }
                    resolve(orderView);
                })
                .catch(errorCode => {
                    return reject(errorCode);
                })
            })
            .catch(errorCode => {
                return reject(errorCode);
            })
       })
    }

    customerReviewOrder(database, orderCode, orderRating, orderReview) {
        return new Promise((resolve,reject) => {
            Order.authenticateOrder(database, orderCode, this.customerCode, null)
            .then(result => {
                if (result.length === 0) {
                    return reject(403);
                }

                const authenticatedOrder = result[0];

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

                anOrder.setRatingReview(database, orderRating, orderReview)
                .then(result => {
                    resolve();
                })
                .catch(errorCode => {
                    return reject(errorCode);
                })
            })
            .catch(errorCode => {
                return reject(errorCode);
            })
       })
    }

    async customerReportOrder(database, orderCode) {
        try {
            const authenticateResult = await Order.authenticateOrder(database, orderCode, this.customerCode, null)
            if (authenticateResult.length === 0) {
                return Promise.reject(403);
            }
            const authenticatedOrder = authenticateResult[0];

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

            await anOrder.reportOrder(database);

            return Promise.resolve();
        }
        catch(dbError) {
            return Promise.reject(dbError);
        }
    }

    async customerDeleteOrder(database, orderCode) {
        try {
            const authenticateResult = await Order.authenticateOrder(database, orderCode, this.customerCode, null)
            if (authenticateResult.length === 0) {
                return Promise.reject(403);
            }
            const authenticatedOrder = authenticateResult[0];

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

            await anOrder.deleteOrder(database);

            return Promise.resolve();
        }
        catch(dbError) {
            return Promise.reject(dbError);
        }
    }

    convertDate(dateToConvert) {
        const convertedDate = moment.tz(dateToConvert, 'ddd MMM DD YYYY HH:mm:ss [GMT]Z (z)', 'Australia/Sydney');
        const formattedDate = convertedDate.format('YYYY-MM-DD');
        return formattedDate;
    }

    async customerViewActiveOrder(database) {
        try {
            const activeOrders = await Order.getActiveOrders(database, this.customerCode, null);

            for (let i = 0; i < activeOrders.length; i++) {
                const orderDate = activeOrders[i].orderDate;
                const convertedOrderDate = this.convertDate(orderDate);
                activeOrders[i].orderDate = convertedOrderDate;
            }

            return Promise.resolve(activeOrders);
        }
        catch(dbError) {
            return Promise.reject(dbError);
        }
    }

    async customerViewPastOrder(database) {
        try {
            const pastOrders = await Order.getPastOrders(database, this.customerCode, null);

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
}

module.exports = Customer;