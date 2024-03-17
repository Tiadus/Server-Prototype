class Cart {
    constructor(cartCode) {
        this.cartCode = cartCode;
    }

    static authenticateCart(database, customerCode) {
        return new Promise((resolve,reject) => {
            const sql = "SELECT * FROM CUSTOMER_CART WHERE customerCode = ?";
            const sqlValue = [customerCode];
            
            database.query(sql, sqlValue, (dbError,result) => {
                if (dbError) {
                    return reject(500);
                }

                resolve(result);
            })
        })
    }

    static createCartCode(customerCode, restaurantCode) {
        const cartCode = "C" + "C" + customerCode.toString() + "R" + restaurantCode.toString();
        return cartCode;
    }

    static insertCart(database, customerCode, restaurantCode, cartCode) {
        return new Promise((resolve,reject) => {
            const sql = "INSERT INTO CUSTOMER_CART VALUES(?, ?, ?)";
            const sqlValue = [customerCode, restaurantCode, cartCode];
            database.query(sql, sqlValue, (dbError, result) => {
                if (dbError) {
                    console.log(dbError);
                    return reject(500);
                }

                resolve(result);
            })
        })
    }

    getCartCode() {
        return this.cartCode;
    }

    viewRestaurant(database) {
        return new Promise((resolve,reject) => {
            let sql = 
            "SELECT RESTAURANT.restaurantCode, RESTAURANT.restaurantName, RESTAURANT.restaurantLat, RESTAURANT.restaurantLon \
            FROM CUSTOMER_CART JOIN RESTAURANT ON CUSTOMER_CART.restaurantCode = RESTAURANT.restaurantCode \
            WHERE cartCode = ?";

            let sqlValue = [this.cartCode];

            database.query(sql, sqlValue, (dbError,result) => {
                if (dbError) {
                    console.log(dbError);
                    return reject(500);
                }

                resolve(result);
            })
        })
    }

    getItem(database, itemName) {
        return new Promise((resolve,reject) => {
            let sql = 
            'SELECT RESTAURANT_ITEM.restaurantCode, RESTAURANT_ITEM.itemName, CART_ITEM.itemPrice, CART_ITEM.itemQuantity, \
            ROUND((CART_ITEM.itemPrice * CART_ITEM.itemQuantity),2) AS totalUnitPrice, RESTAURANT_ITEM.itemIMG \
            FROM CART_ITEM \
            JOIN CUSTOMER_CART ON CART_ITEM.cartCode = CUSTOMER_CART.cartCode \
            JOIN RESTAURANT_ITEM ON CUSTOMER_CART.restaurantCode = RESTAURANT_ITEM.restaurantCode AND CART_ITEM.itemName = RESTAURANT_ITEM.itemName \
            WHERE CART_ITEM.cartCode = ?';

            let sqlValue = [this.cartCode];

            if (itemName !== null) {
                sql += " AND CART_ITEM.itemName = ?";
                sqlValue.push(itemName);
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

    addItem(database, itemName, itemPrice, itemQuantity) {
        return new Promise((resolve, reject) => {
            const fetchItemPromise = this.getItem(database, itemName);
            fetchItemPromise
            .then(result => {
                if (result.length === 0) {
                    const sql = "INSERT INTO CART_ITEM VALUES (?, ?, ?, ?)";
                    const sqlValue = [this.cartCode, itemName, itemPrice, itemQuantity];
                    database.query(sql, sqlValue, (dbError, result) => {
                        if (dbError) {
                            console.log(dbError);
                            return reject(500);
                        }

                        resolve();
                    })
                }

                if (result.length > 0) {
                    const sql = "UPDATE CART_ITEM SET itemQuantity = itemQuantity + 1 WHERE cartCode = ? AND itemName = ?";
                    const sqlValue = [this.cartCode, itemName];
                    database.query(sql, sqlValue, (dbError, result) => {
                        if (dbError) {
                            console.log(dbError);
                            return reject(500);
                        }

                        resolve();
                    })
                }
            })
            .catch(errorCode => {
                return reject(errorCode);
            });
        })
    }

    modifyItem(database, itemName, itemQuantity) {
        return new Promise((resolve,reject) => {
            if (itemQuantity > 0) {
                const sql = "UPDATE CART_ITEM SET itemQuantity = ? WHERE cartCode = ? AND itemName = ?";
                const sqlValue = [parseInt(itemQuantity), this.cartCode, itemName];
                database.query(sql, sqlValue, (dbError, result) => {
                    if (dbError) {
                        console.log(dbError);
                        return reject(500);
                    }
    
                    resolve(result);
                })
            }

            if (itemQuantity === 0) {
                const sql = "DELETE FROM CART_ITEM WHERE cartCode = ? AND itemName = ?";
                const sqlValue = [this.cartCode, itemName];
                database.query(sql, sqlValue, (dbError, result) => {
                    if (dbError) {
                        console.log(dbError);
                        return reject(500);
                    }
    
                    resolve(result);
                })
            }
        })
    }

    async deleteCart(database, customerCode) {
        try {
            const sql = 'DELETE FROM CUSTOMER_CART \
            WHERE customerCode = ? AND cartCode = ?'
            const sqlValue = [customerCode, this.cartCode];

            const dbResult = await database.promise().query(sql, sqlValue);
            //console.log(dbResult);
            return Promise.resolve();
        }
        catch(dbError) {
            console.log(dbError);
            return Promise.reject(500);
        }
    }
}

module.exports = Cart;