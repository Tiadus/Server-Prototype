const express = require('express');
const bodyParser = require('body-parser');

const errorIdentify = require('./errorClassification/errorIdentify.js');
const Customer = require('./class/Customer.js');
const Restaurant = require('./class/Restaurant.js');
const dbManager = require('./dbManager.js');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

const db = new dbManager();

const database = db.getPoolForServer();

app.post('/api/customer/register', (req,res) => {
    const body = req.body;
    const customerEmail = body.customerEmail;
    const customerName = body.customerName;
    const customerPhone = body.customerPhone;
    const customerPassword = body.customerPassword;

    if (customerEmail === undefined || customerName === undefined || customerPhone === undefined || customerPassword === undefined) {
        return res.send("Wrong Parameter");
    }

    Customer.registerCustomer(database, customerEmail, customerName, customerPhone, customerPassword)
    .then(customerCode => {
        res.json({customerCode: customerCode});
    })
    .catch(errorCode => {
        const error = errorIdentify(errorCode);
        res.status(error.status).json({error: error.message});
    })
})

app.post('/api/customer/login', (req,res) => {
    const authen = req.headers.authorization;
    if (authen === undefined) {
        return res.send("Server Unavailable");
    }

    const encodedCredential = authen.split(" ")[1];
    const decodedCredential = atob(encodedCredential);

    const authenParts = decodedCredential.split(":");
    const customerEmail = authenParts[0];
    const customerPassword = authenParts[1];

    if (customerEmail === undefined || customerPassword === undefined) {
        return res.send("Wrong Parameter");
    }

    const customerAuthentication = Customer.authenticateCustomer(database, customerEmail, customerPassword);
    customerAuthentication
    .then(result => {
        const authenticatedCustomer = result[0];
        const aCustomer = new Customer(authenticatedCustomer.customerCode, authenticatedCustomer.customerEmail, authenticatedCustomer.customerName, authenticatedCustomer.membershipEnd);
        aCustomer.customerLogin(database)
        .then(totalItemInCart => {
            res.json({
                customerCode: authenticatedCustomer.customerCode,
                totalItemInCart: totalItemInCart
            });
        })
        .catch(errorCode => {
            const error = errorIdentify(errorCode);
            res.status(error.status).json({error: error.message});
        })
    })
    .catch(errorCode => {
        const error = errorIdentify(errorCode);
        res.status(error.status).json({error: error.message});
    })
})

app.get('/api/customer/information', async (req, res) => {
    const authen = req.headers.authorization;
    if (authen === undefined) {
        return res.send("Server Unavailable");
    }

    const encodedCredential = authen.split(" ")[1];
    const decodedCredential = atob(encodedCredential);

    const authenParts = decodedCredential.split(":");
    const customerEmail = authenParts[0];
    const customerPassword = authenParts[1];

    try {
        const customerAuthenticationPromise = await Customer.authenticateCustomer(database, customerEmail, customerPassword);
        const authenticatedCustomer = customerAuthenticationPromise[0];
        const aCustomer = new Customer(authenticatedCustomer.customerCode, authenticatedCustomer.customerEmail, authenticatedCustomer.customerName, authenticatedCustomer.membershipEnd);
        const customerInformation = aCustomer.getInformation();

        res.json(customerInformation)
    } catch(errorCode) {
        const error = errorIdentify(errorCode);
        res.status(error.status).json({error: error.message});
    }
})

app.post('/api/customer/edit/email', (req, res) => {
    const authen = req.headers.authorization;
    if (authen === undefined) {
        return res.send("Server Unavailable");
    }

    const encodedCredential = authen.split(" ")[1];
    const decodedCredential = atob(encodedCredential);

    const authenParts = decodedCredential.split(":");
    const customerEmail = authenParts[0];
    const customerPassword = authenParts[1];

    const newEmail = req.body.newEmail;

    if (newEmail === undefined) {
        return res.send("Wrong Parameter");
    }

    customerAuthentication = Customer.authenticateCustomer(database, customerEmail, customerPassword);
    customerAuthentication
    .then(result => {
        const authenticatedCustomer = result[0];
        const aCustomer = new Customer(authenticatedCustomer.customerCode, authenticatedCustomer.customerEmail, authenticatedCustomer.customerName, authenticatedCustomer.membershipEnd);
    
        aCustomer.setEmail(database, newEmail)
        .then(result => {
            res.status(200).send({ message: 'Email Successfully Changed' });
        })
        .catch(errorCode => {
            const error = errorIdentify(errorCode);
            res.status(error.status).json({error: error.message});
        });
    })
    .catch(errorCode => {
        const error = errorIdentify(errorCode);
        res.status(error.status).json({error: error.message});
    })
})

app.post('/api/customer/edit/phone', (req, res) => {
    const authen = req.headers.authorization;
    if (authen === undefined) {
        return res.send("Server Unavailable");
    }

    const encodedCredential = authen.split(" ")[1];
    const decodedCredential = atob(encodedCredential);

    const authenParts = decodedCredential.split(":");
    const customerEmail = authenParts[0];
    const customerPassword = authenParts[1];

    const newPhone = req.body.newPhone;

    if (newPhone === undefined) {
        return res.send("Wrong Parameter");
    }

    const customerAuthentication = Customer.authenticateCustomer(database, customerEmail, customerPassword);
    customerAuthentication
    .then(result => {
        const authenticatedCustomer = result[0];
        const aCustomer = new Customer(authenticatedCustomer.customerCode, authenticatedCustomer.customerEmail, authenticatedCustomer.customerName, authenticatedCustomer.membershipEnd);
    
        aCustomer.setPhone(database, newPhone)
        .then(result => {
            res.status(200).send({ message: 'Phone Successfully Changed' });
        })
        .catch(errorCode => {
            const error = errorIdentify(errorCode);
            res.status(error.status).json({error: error.message});
        });
    })
    .catch(errorCode => {
        const error = errorIdentify(errorCode);
        res.status(error.status).json({error: error.message});
    })
})

app.post('/api/customer/edit/password', (req, res) => {
    const authen = req.headers.authorization;
    if (authen === undefined) {
        return res.send("Server Unavailable");
    }

    const encodedCredential = authen.split(" ")[1];
    const decodedCredential = atob(encodedCredential);

    const authenParts = decodedCredential.split(":");
    const customerEmail = authenParts[0];
    const customerPassword = authenParts[1];

    const newPassword = req.body.newPassword;

    if (newPassword === undefined) {
        return res.send("Wrong Parameter");
    }

    const customerAuthentication = Customer.authenticateCustomer(database, customerEmail, customerPassword);
    customerAuthentication
    .then(result => {
        const authenticatedCustomer = result[0];
        const aCustomer = new Customer(authenticatedCustomer.customerCode, authenticatedCustomer.customerEmail, authenticatedCustomer.customerName, authenticatedCustomer.membershipEnd);
    
        aCustomer.setPassword(database, newPassword)
        .then(result => {
            res.status(200).send({ message: 'Password Successfully Changed' });
        })
        .catch(errorCode => {
            const error = errorIdentify(errorCode);
            res.status(error.status).json({error: error.message});
        })
    })
    .catch(errorCode => {
        const error = errorIdentify(errorCode);
        res.status(error.status).json({error: error.message});
    })
})

app.post('/api/customer/membership/extend', async (req, res) => {
    const authen = req.headers.authorization;
    if (authen === undefined) {
        return res.send("Server Unavailable");
    }

    const encodedCredential = authen.split(" ")[1];
    const decodedCredential = atob(encodedCredential);

    const authenParts = decodedCredential.split(":");
    const customerEmail = authenParts[0];
    const customerPassword = authenParts[1];

    const ext = req.body.ext;

    if (ext === undefined) {
        return res.send("Wrong Parameter");
    }

    const extensionType = parseInt(ext);

    if (extensionType !== 0 && extensionType !== 1) {
        return res.send("Wrong Type");
    }

    try {
        const customerAuthenticationPromise = await Customer.authenticateCustomer(database, customerEmail, customerPassword);
        const authenticatedCustomer = customerAuthenticationPromise[0];
        const aCustomer = new Customer(authenticatedCustomer.customerCode, authenticatedCustomer.customerEmail, authenticatedCustomer.customerName, authenticatedCustomer.membershipEnd);
        await aCustomer.extendMembership(database, extensionType);

        res.status(200).send({ message: 'Membership Successfully Extended' });
    } catch(errorCode) {
        const error = errorIdentify(errorCode);
        res.status(error.status).json({error: error.message});
    }
})

app.get('/api/customer/payment/view', async (req, res) => {
    const authen = req.headers.authorization;
    if (authen === undefined) {
        return res.send("Server Unavailable");
    }

    const encodedCredential = authen.split(" ")[1];
    const decodedCredential = atob(encodedCredential);

    const authenParts = decodedCredential.split(":");
    const customerEmail = authenParts[0];
    const customerPassword = authenParts[1];

    try {
        const customerAuthenticationPromise = await Customer.authenticateCustomer(database, customerEmail, customerPassword);
        const authenticatedCustomer = customerAuthenticationPromise[0];
        const aCustomer = new Customer(authenticatedCustomer.customerCode, authenticatedCustomer.customerEmail, authenticatedCustomer.customerName, authenticatedCustomer.membershipEnd);
        const customerPayments = await aCustomer.getPaymentMethods(database);
        
        res.json(customerPayments);
    } catch(errorCode) {
        const error = errorIdentify(errorCode);
        res.status(error.status).json({error: error.message});
    }
})

app.post('/api/customer/payment/add', async (req, res) => {
    const authen = req.headers.authorization;
    if (authen === undefined) {
        return res.send("Server Unavailable");
    }

    const encodedCredential = authen.split(" ")[1];
    const decodedCredential = atob(encodedCredential);

    const authenParts = decodedCredential.split(":");
    const customerEmail = authenParts[0];
    const customerPassword = authenParts[1];

    const cardNumber = req.body.cn;
    const cardOwner = req.body.co;
    const cardExpMonth = req.body.em;
    const cardExpYear = req.body.ey;

    if (cardNumber === undefined || cardOwner === undefined || cardExpMonth === undefined || cardExpYear === undefined) {
        return res.send("Wrong Parameter");
    }

    try {
        const customerAuthenticationPromise = await Customer.authenticateCustomer(database, customerEmail, customerPassword);
        const authenticatedCustomer = customerAuthenticationPromise[0];
        const aCustomer = new Customer(authenticatedCustomer.customerCode, authenticatedCustomer.customerEmail, authenticatedCustomer.customerName, authenticatedCustomer.membershipEnd);
        await aCustomer.addPaymentMethods(database, cardNumber, cardOwner, parseInt(cardExpMonth), parseInt(cardExpYear));
        
        res.status(200).send({ message: 'Payment Method Successfully Added!' });
    } catch(errorCode) {
        const error = errorIdentify(errorCode);
        res.status(error.status).json({error: error.message});
    }
})

app.post('/api/customer/payment/delete', async (req, res) => {
    const authen = req.headers.authorization;
    if (authen === undefined) {
        return res.send("Server Unavailable");
    }

    const encodedCredential = authen.split(" ")[1];
    const decodedCredential = atob(encodedCredential);

    const authenParts = decodedCredential.split(":");
    const customerEmail = authenParts[0];
    const customerPassword = authenParts[1];

    const paymentCode = req.body.pc;

    if (paymentCode === undefined) {
        return res.send("Wrong Parameter");
    }

    try {
        const customerAuthenticationPromise = await Customer.authenticateCustomer(database, customerEmail, customerPassword);
        const authenticatedCustomer = customerAuthenticationPromise[0];
        const aCustomer = new Customer(authenticatedCustomer.customerCode, authenticatedCustomer.customerEmail, authenticatedCustomer.customerName, authenticatedCustomer.membershipEnd);
        await aCustomer.deletePaymentMethods(database, parseInt(paymentCode));
        
        res.status(200).send({ message: 'Payment Method Successfully Deleted!' });
    } catch(errorCode) {
        const error = errorIdentify(errorCode);
        res.status(error.status).json({error: error.message});
    }
})

app.get('/api/restaurants', (req,res) => {
    const keyword = req.query.kw;
    if (keyword === undefined) {
        return res.send("Server Unavailable");
    }

    const ratingLowerBound = req.query.rlb;

    const getRestaurantsByKeywordPromise = Restaurant.getRestaurantByKeyword(database, keyword, ratingLowerBound);
    getRestaurantsByKeywordPromise
    .then(result => {
        const radius = req.query.r;
        if (radius !== undefined) {
            const cusLat = req.query.lat;
            const cusLon = req.query.lon;
            
            if (cusLat === undefined || cusLon === undefined) {
                return res.send("Wrong Parameter");
            }

            const distanceFilteredRestaurants = Restaurant.filterRestaurantByDistance(result, parseFloat(cusLat), parseFloat(cusLon), parseFloat(radius));
            res.json(distanceFilteredRestaurants);
        } else {
            res.json(result);
        }
    })
    .catch(errorCode => {
        const error = errorIdentify(errorCode);
        res.status(error.status).json({error: error.message});
    })
})

app.get('/api/categories', (req,res) => {
    const getCategoriesPromise = Restaurant.getCategories(database);
    getCategoriesPromise
    .then(result => {
        res.json(result);
    })
    .catch(errorCode => {
        const error = errorIdentify(errorCode);
        res.status(error.status).json({error: error.message});
    })
})

app.get('/api/restaurants/?:category', (req,res) => {
    const category = req.params.category;

    if (category === undefined) {
        return res.send("Server Unavailable");
    }

    const ratingLowerBound = req.query.rlb;

    const getRestaurantsByCategory = Restaurant.getRestaurantByCategory(database, category, ratingLowerBound);
    getRestaurantsByCategory
    .then(result => {
        const radius = req.query.r;
        if (radius !== undefined) {
            const cusLat = req.query.lat;
            const cusLon = req.query.lon;
            
            if (cusLat === undefined || cusLon === undefined) {
                return res.send("Wrong Parameter");
            }

            const distanceFilteredRestaurants = Restaurant.filterRestaurantByDistance(result, parseFloat(cusLat), parseFloat(cusLon), parseFloat(radius));
            res.json(distanceFilteredRestaurants);
        } else {
            res.json(result);
        }
    })
    .catch(errorCode => {
        const error = errorIdentify(errorCode);
        res.status(error.status).json({error: error.message});
    }) 
})

app.get('/api/restaurant/?:restaurantName', (req, res) => {
    const restaurantName = req.params.restaurantName;

    if (restaurantName === undefined) {
        res.send("Server Unavailable");
    }

    Promise.all([
        Restaurant.getRestaurantPublicDetail(database, restaurantName),
        Restaurant.getRestaurantItems(database, restaurantName)
    ])
    .then(results => {
        const backendResult = {
            restaurantDetail: results[0],
            restaurantItems: results[1]
        }
        res.json(backendResult);
    })
    .catch(errorCode => {
        if (isNaN(errorCode) === true) {
            console.log(errorCode);
            return res.status(500).json({error: "Internal Server Error"});
        }
        const error = errorIdentify(errorCode);
        res.status(error.status).json({error: error.message});
    })
})

app.post('/api/customer/cart/add', (req, res) => {
    const authen = req.headers.authorization;
    if (authen === undefined) {
        return res.send("Server Unavailable");
    }

    const encodedCredential = authen.split(" ")[1];
    const decodedCredential = atob(encodedCredential);

    const authenParts = decodedCredential.split(":");
    const customerEmail = authenParts[0];
    const customerPassword = authenParts[1];

    customerAuthentication = Customer.authenticateCustomer(database, customerEmail, customerPassword);
    customerAuthentication
    .then(result => {
        const body = req.body;
        const restaurantCode = body.restaurantCode;
        const itemName = body.itemName;
        const itemPrice = body.itemPrice;
        const itemQuantityToAdd = body.itemQuantityToAdd;

        if (restaurantCode === undefined || itemName === undefined || itemPrice === undefined || itemQuantityToAdd === undefined) {
            return res.send("Wrong Parameter");
        }

        const authenticatedCustomer = result[0];
        const aCustomer = new Customer(authenticatedCustomer.customerCode, authenticatedCustomer.customerEmail, authenticatedCustomer.customerName, authenticatedCustomer.membershipEnd);
        const customerAddItemPromise = aCustomer.addItemToCart(database, parseInt(restaurantCode), itemName, itemPrice, itemQuantityToAdd);
        customerAddItemPromise
        .then(result => {
            console.log("Operation Add Item To Cart Completed!");
            res.json({totalItemInCart: result})
        })
        .catch(errorCode => {
            const error = errorIdentify(errorCode);
            res.status(error.status).json({error: error.message});
        })
    })
    .catch(errorCode => {
        const error = errorIdentify(errorCode);
        res.status(error.status).json({error: error.message});
    })
})

app.get('/api/customer/cart/view', (req, res) => {
    const authen = req.headers.authorization;
    if (authen === undefined) {
        return res.send("Server Unavailable");
    }

    const encodedCredential = authen.split(" ")[1];
    const decodedCredential = atob(encodedCredential);

    const authenParts = decodedCredential.split(":");
    const customerEmail = authenParts[0];
    const customerPassword = authenParts[1];

    customerAuthentication = Customer.authenticateCustomer(database, customerEmail, customerPassword);
    customerAuthentication
    .then(result => {
        const authenticatedCustomer = result[0];
        const aCustomer = new Customer(authenticatedCustomer.customerCode, authenticatedCustomer.customerEmail, authenticatedCustomer.customerName, authenticatedCustomer.membershipEnd);
    
        const cusLat = req.query.lat;
        const cusLon = req.query.lon;
        
        if (cusLat === undefined || cusLon === undefined) {
            return res.send("Wrong Parameter");
        }
    
        const displayCartPromise = aCustomer.displayCart(database, cusLat, cusLon)
        displayCartPromise
        .then(result => {
            res.json(result);
        })
        .catch(errorCode => {
            const error = errorIdentify(errorCode);
            res.status(error.status).json({error: error.message});
        });
    })
    .catch(errorCode => {
        const error = errorIdentify(errorCode);
        res.status(error.status).json({error: error.message});
    })
})

app.post('/api/customer/cart/update', (req,res) => {
    const authen = req.headers.authorization;
    if (authen === undefined) {
        return res.send("Server Unavailable");
    }

    const encodedCredential = authen.split(" ")[1];
    const decodedCredential = atob(encodedCredential);

    const authenParts = decodedCredential.split(":");
    const customerEmail = authenParts[0];
    const customerPassword = authenParts[1];

    const customerAuthentication = Customer.authenticateCustomer(database, customerEmail, customerPassword);
    customerAuthentication
    .then(result => {
        const body = req.body;
        const itemName = body.itemName;
        const itemQuantity = body.itemQuantity;

        if (itemName === undefined || itemQuantity === undefined) {
            return res.send("Wrong Parameter");
        }

        const authenticatedCustomer = result[0];
        const aCustomer = new Customer(authenticatedCustomer.customerCode, authenticatedCustomer.customerEmail, authenticatedCustomer.customerName, authenticatedCustomer.membershipEnd);
        const customerModifyItemPromise = aCustomer.modifyItemInCart(database, itemName, parseInt(itemQuantity));
        customerModifyItemPromise
        .then(result => {
            console.log("Operation Modify Item In Cart Completed!");
            res.json({totalItemInCart: result});
        })
        .catch(errorCode => {
            const error = errorIdentify(errorCode);
            res.status(error.status).json({error: error.message});
        })
    })
    .catch(errorCode => {
        const error = errorIdentify(errorCode);
        res.status(error.status).json({error: error.message});
    })
})

app.post('/api/customer/cart/delete', (req,res) => {
    const authen = req.headers.authorization;
    if (authen === undefined) {
        return res.send("Server Unavailable");
    }

    const encodedCredential = authen.split(" ")[1];
    const decodedCredential = atob(encodedCredential);

    const authenParts = decodedCredential.split(":");
    const customerEmail = authenParts[0];
    const customerPassword = authenParts[1];

    const customerAuthentication = Customer.authenticateCustomer(database, customerEmail, customerPassword);
    customerAuthentication
    .then(result => {
        const body = req.body;

        const authenticatedCustomer = result[0];
        const aCustomer = new Customer(authenticatedCustomer.customerCode, authenticatedCustomer.customerEmail, authenticatedCustomer.customerName, authenticatedCustomer.membershipEnd);
        const customerDeleteCartPromise = aCustomer.customerDeleteCart(database);
        customerDeleteCartPromise
        .then(result => {
            res.status(200).send({ message: 'Payment Method Successfully Deleted!' });
        })
        .catch(errorCode => {
            const error = errorIdentify(errorCode);
            res.status(error.status).json({error: error.message});
        })
    })
    .catch(errorCode => {
        const error = errorIdentify(errorCode);
        res.status(error.status).json({error: error.message});
    })
})

app.post('/api/customer/order/create', (req, res) => {
    const authen = req.headers.authorization;
    if (authen === undefined) {
        return res.send("Server Unavailable");
    }

    const encodedCredential = authen.split(" ")[1];
    const decodedCredential = atob(encodedCredential);

    const authenParts = decodedCredential.split(":");
    const customerEmail = authenParts[0];
    const customerPassword = authenParts[1];

    const customerAuthentication = Customer.authenticateCustomer(database, customerEmail, customerPassword);
    customerAuthentication
    .then(result => {
        const body = req.body;
        const recipientName = body.recipientName;
        const recipientPhone = body.recipientPhone;
        const orderLocation = body.orderLocation;
        const orderCost = body.orderCost;

        if (recipientName === undefined || recipientPhone === undefined || orderLocation === undefined || orderCost === undefined) {
            return res.send("Wrong Parameter");
        }

        const authenticatedCustomer = result[0];
        const aCustomer = new Customer(authenticatedCustomer.customerCode, authenticatedCustomer.customerEmail, authenticatedCustomer.customerName, authenticatedCustomer.membershipEnd);
        aCustomer.createCustomerOrder(database, recipientName, recipientPhone, orderLocation, parseFloat(orderCost))
        .then((orderCode) => {
            res.json({orderCode: orderCode})
        })
        .catch(errorCode => {
            const error = errorIdentify(errorCode);
            res.status(error.status).json({error: error.message});
        })
    })
    .catch(errorCode => {
        const error = errorIdentify(errorCode);
        res.status(error.status).json({error: error.message});
    })
})

app.get('/api/customer/orders/active', (req, res) => {
    const authen = req.headers.authorization;
    if (authen === undefined) {
        return res.send("Server Unavailable");
    }

    const encodedCredential = authen.split(" ")[1];
    const decodedCredential = atob(encodedCredential);

    const authenParts = decodedCredential.split(":");
    const customerEmail = authenParts[0];
    const customerPassword = authenParts[1];

    const customerAuthentication = Customer.authenticateCustomer(database, customerEmail, customerPassword);
    customerAuthentication.then(result => {
        const authenticatedCustomer = result[0];
        const aCustomer = new Customer(authenticatedCustomer.customerCode, authenticatedCustomer.customerEmail, authenticatedCustomer.customerName, authenticatedCustomer.membershipEnd);
        aCustomer.customerViewActiveOrder(database)
        .then((orders) => {
            res.json(orders);
        })
        .catch(errorCode => {
            throw errorCode;
        })
    })
    .catch(errorCode => {
        if (isNaN(errorCode) === true) {
            console.log(errorCode);
            return res.status(500).json({error: "Internal Server Error"});
        }
        const error = errorIdentify(errorCode);
        res.status(error.status).json({error: error.message});
    })
})

app.get('/api/customer/orders/history', (req, res) => {
    const authen = req.headers.authorization;
    if (authen === undefined) {
        return res.send("Server Unavailable");
    }

    const encodedCredential = authen.split(" ")[1];
    const decodedCredential = atob(encodedCredential);

    const authenParts = decodedCredential.split(":");
    const customerEmail = authenParts[0];
    const customerPassword = authenParts[1];

    const customerAuthentication = Customer.authenticateCustomer(database, customerEmail, customerPassword);
    customerAuthentication.then(result => {
        const authenticatedCustomer = result[0];
        const aCustomer = new Customer(authenticatedCustomer.customerCode, authenticatedCustomer.customerEmail, authenticatedCustomer.customerName, authenticatedCustomer.membershipEnd);
        aCustomer.customerViewPastOrder(database)
        .then((orders) => {
            res.json(orders);
        })
        .catch(errorCode => {
            throw errorCode;
        })
    })
    .catch(errorCode => {
        const error = errorIdentify(errorCode);
        res.status(error.status).json({error: error.message});
    })
})

app.get('/api/customer/order', (req,res) => {
    const authen = req.headers.authorization;
    if (authen === undefined) {
        return res.send("Server Unavailable");
    }

    const encodedCredential = authen.split(" ")[1];
    const decodedCredential = atob(encodedCredential);

    const authenParts = decodedCredential.split(":");
    const customerEmail = authenParts[0];
    const customerPassword = authenParts[1];

    const customerAuthentication = Customer.authenticateCustomer(database, customerEmail, customerPassword);
    customerAuthentication.then(result => {
        const query = req.query;
        const orderCode = query.oc;

        if (orderCode === undefined) {
            return res.send("Wrong Parameter");
        }

        const authenticatedCustomer = result[0];
        const aCustomer = new Customer(authenticatedCustomer.customerCode, authenticatedCustomer.customerEmail, authenticatedCustomer.customerName, authenticatedCustomer.membershipEnd);
        const customerViewOrderPromise = aCustomer.customerViewOrder(database, orderCode);
        customerViewOrderPromise
        .then(result => {
            res.json(result);
        })
        .catch(errorCode => {
            if (isNaN(errorCode) === true) {
                console.log(errorCode);
                return res.status(500).json({error: "Internal Server Error"});
            }
            const error = errorIdentify(errorCode);
            res.status(error.status).json({error: error.message});
        })
    })
    .catch(errorCode => {
        if (isNaN(errorCode) === true) {
            console.log(errorCode);
            return res.status(500).json({error: "Internal Server Error"});
        }
        const error = errorIdentify(errorCode);
        res.status(error.status).json({error: error.message});
    })
})

app.post('/api/customer/order/review', (req, res) => {
    const authen = req.headers.authorization;
    if (authen === undefined) {
        return res.send("Server Unavailable");
    }

    const encodedCredential = authen.split(" ")[1];
    const decodedCredential = atob(encodedCredential);

    const authenParts = decodedCredential.split(":");
    const customerEmail = authenParts[0];
    const customerPassword = authenParts[1];

    const customerAuthentication = Customer.authenticateCustomer(database, customerEmail, customerPassword);
    customerAuthentication.then(result => {
        const body = req.body;
        const orderCode = body.oc;
        const orderRating = body.rating;
        const orderReview = body.review;

        if (orderCode === undefined || orderRating === undefined || orderReview === undefined) {
            return res.send("Wrong Parameter");
        }

        const authenticatedCustomer = result[0];
        const aCustomer = new Customer(authenticatedCustomer.customerCode, authenticatedCustomer.customerEmail, authenticatedCustomer.customerName, authenticatedCustomer.membershipEnd);
        aCustomer.customerReviewOrder(database, orderCode, parseInt(orderRating), orderReview)
        .then(() => {
            res.status(200).send({ message: 'Order reviewed successfully' });
        })
        .catch(errorCode => {
            if (isNaN(errorCode) === true) {
                console.log(errorCode);
                return res.status(500).json({error: "Internal Server Error"});
            }
            const error = errorIdentify(errorCode);
            res.status(error.status).json({error: error.message});
        })
    })
    .catch(errorCode => {
        if (isNaN(errorCode) === true) {
            console.log(errorCode);
            return res.status(500).json({error: "Internal Server Error"});
        }
        const error = errorIdentify(errorCode);
        res.status(error.status).json({error: error.message});
    })
})

app.post('/api/customer/order/report', (req, res) => {
    const authen = req.headers.authorization;
    if (authen === undefined) {
        return res.send("Server Unavailable");
    }

    const encodedCredential = authen.split(" ")[1];
    const decodedCredential = atob(encodedCredential);

    const authenParts = decodedCredential.split(":");
    const customerEmail = authenParts[0];
    const customerPassword = authenParts[1];

    const customerAuthentication = Customer.authenticateCustomer(database, customerEmail, customerPassword);
    customerAuthentication.then(result => {
        const body = req.body;
        const orderCode = body.oc;

        if (orderCode === undefined) {
            return res.send("Wrong Parameter");
        }

        const authenticatedCustomer = result[0];
        const aCustomer = new Customer(authenticatedCustomer.customerCode, authenticatedCustomer.customerEmail, authenticatedCustomer.customerName, authenticatedCustomer.membershipEnd);
        aCustomer.customerReportOrder(database, orderCode)
        .then(() => {
            res.status(200).send({ message: 'Order reported successfully' });
        })
        .catch(errorCode => {
            if (isNaN(errorCode) === true) {
                console.log(errorCode);
                return res.status(500).json({error: "Internal Server Error"});
            }
            const error = errorIdentify(errorCode);
            res.status(error.status).json({error: error.message});
        })
    })
    .catch(errorCode => {
        if (isNaN(errorCode) === true) {
            console.log(errorCode);
            return res.status(500).json({error: "Internal Server Error"});
        }
        const error = errorIdentify(errorCode);
        res.status(error.status).json({error: error.message});
    })
})

app.post('/api/customer/order/delete', async (req, res) => {
    const authen = req.headers.authorization;
    if (authen === undefined) {
        return res.send("Server Unavailable");
    }

    const encodedCredential = authen.split(" ")[1];
    const decodedCredential = atob(encodedCredential);

    const authenParts = decodedCredential.split(":");
    const customerEmail = authenParts[0];
    const customerPassword = authenParts[1];

    const orderCode = req.body.oc;

    if (orderCode === undefined) {
        return res.send("Wrong Parameter");
    }

    try {
        const customerAuthenticationPromise = await Customer.authenticateCustomer(database, customerEmail, customerPassword);
        const authenticatedCustomer = customerAuthenticationPromise[0];
        const aCustomer = new Customer(authenticatedCustomer.customerCode, authenticatedCustomer.customerEmail, authenticatedCustomer.customerName, authenticatedCustomer.membershipEnd);
        await aCustomer.customerDeleteOrder(database, orderCode);

        res.status(200).send({ message: 'Order Successfully Canceled' });
    } catch(errorCode) {
        const error = errorIdentify(errorCode);
        res.status(error.status).json({error: error.message});
    }
})

function createRestaurantObject(authenticationResult) {
    const restaurantCode = authenticationResult.restaurantCode;
    const restaurantEmail = authenticationResult.restaurantEmail;
    const restaurantName = authenticationResult.restaurantName;
    const restaurantPhone = authenticationResult.restaurantPhone;
    const restaurantABN = authenticationResult.restaurantABN;
    const restaurantBanking = authenticationResult.restaurantBanking;
    const restaurantLocation = authenticationResult.restaurantLocation;
    const restaurantLat = authenticationResult.restaurantLat;
    const restaurantLon = authenticationResult.restaurantLon;
    const restaurantTotalRating = authenticationResult.restaurantTotalRating;
    const restaurantTotalOrder = authenticationResult.restaurantTotalOrder;
    const restaurantIMG = authenticationResult.restaurantIMG;
    const isActive = authenticationResult.isActive;

    const aRestaurant = new 
    Restaurant(
        restaurantCode, restaurantEmail, restaurantName, restaurantPhone, restaurantABN, restaurantBanking, restaurantLocation, 
        restaurantLat, restaurantLon, restaurantTotalRating, restaurantTotalOrder, restaurantIMG, isActive
    )

    return aRestaurant;
}

app.post('/api/owner/register', async (req, res) => {
    const restaurantEmail = req.body.email;
    const restaurantName = req.body.name;
    const restaurantPhone = req.body.phone;
    const restaurantABN = req.body.abn;
    const restaurantBanking = req.body.banking;
    const restaurantLocation = req.body.location;
    const restaurantLat = req.body.lat;
    const restaurantLon = req.body.lon;
    const categories = req.body.categories;

    if (restaurantEmail === undefined || restaurantName === undefined || restaurantPhone === undefined || restaurantABN === undefined || restaurantBanking === undefined) {
        return res.send("Wrong Parameter");
    }

    if (restaurantLocation === undefined || restaurantLat === undefined || restaurantLon === undefined || categories === undefined) {
        return res.send("Wrong Parameter");
    }

    const categoryRestaurant = categories.split(",");
    try {
        const restaurantCode = 
        await Restaurant.registerOwner
        (
            database, restaurantEmail, restaurantName, restaurantPhone, restaurantABN, restaurantBanking, 
            restaurantLocation, parseFloat(restaurantLat), parseFloat(restaurantLon), categoryRestaurant
        );
        res.json({restaurantCode: restaurantCode});
    } catch (errorCode) {
        const error = errorIdentify(errorCode);
        res.status(error.status).json({error: error.message});
    }
})

app.post('/api/owner/login', async (req, res) => {
    const authen = req.headers.authorization;
    if (authen === undefined) {
        return res.send("Server Unavailable");
    }

    const encodedCredential = authen.split(" ")[1];
    const decodedCredential = atob(encodedCredential);

    const authenParts = decodedCredential.split(":");
    const restaurantEmail = authenParts[0];
    const restaurantPassword = authenParts[1];

    try {
        const authenticationResult = await Restaurant.authenticateOwner(database, restaurantEmail, restaurantPassword);
        res.json({restaurantCode: authenticationResult.restaurantCode});
    } catch(errorCode) {
        const error = errorIdentify(errorCode);
        res.status(error.status).json({error: error.message});
    }
})

app.get('/api/owner/information', async (req, res) => {
    const authen = req.headers.authorization;
    if (authen === undefined) {
        return res.send("Server Unavailable");
    }

    const encodedCredential = authen.split(" ")[1];
    const decodedCredential = atob(encodedCredential);

    const authenParts = decodedCredential.split(":");
    const restaurantEmail = authenParts[0];
    const restaurantPassword = authenParts[1];

    try {
        const authenticationResult = await Restaurant.authenticateOwner(database, restaurantEmail, restaurantPassword);

        const aRestaurant = createRestaurantObject(authenticationResult);

        const restaurantInformation = aRestaurant.getInformation();
        res.json(restaurantInformation);
    } catch(errorCode) {
        const error = errorIdentify(errorCode);
        res.status(error.status).json({error: error.message});
    }
})

app.post('/api/owner/edit/email', async (req,res) => {
    const authen = req.headers.authorization;
    if (authen === undefined) {
        return res.send("Server Unavailable");
    }

    const encodedCredential = authen.split(" ")[1];
    const decodedCredential = atob(encodedCredential);

    const authenParts = decodedCredential.split(":");
    const restaurantEmail = authenParts[0];
    const restaurantPassword = authenParts[1];

    const newEmail = req.body.newEmail;

    if (newEmail === undefined) {
        return res.send("Wrong Parameter");
    }

    try {
        const authenticationResult = await Restaurant.authenticateOwner(database, restaurantEmail, restaurantPassword);

        const aRestaurant = createRestaurantObject(authenticationResult);

        await aRestaurant.setEmail(database, newEmail);

        res.status(200).send({ message: 'Email Successfully Updated' });
    } catch(errorCode) {
        const error = errorIdentify(errorCode);
        res.status(error.status).json({error: error.message});
    }
})

app.post('/api/owner/edit/password', async (req,res) => {
    const authen = req.headers.authorization;
    if (authen === undefined) {
        return res.send("Server Unavailable");
    }

    const encodedCredential = authen.split(" ")[1];
    const decodedCredential = atob(encodedCredential);

    const authenParts = decodedCredential.split(":");
    const restaurantEmail = authenParts[0];
    const restaurantPassword = authenParts[1];

    const newPassword = req.body.newPassword;

    if (newPassword === undefined) {
        return res.send("Wrong Parameter");
    }

    try {
        const authenticationResult = await Restaurant.authenticateOwner(database, restaurantEmail, restaurantPassword);

        const aRestaurant = createRestaurantObject(authenticationResult);

        await aRestaurant.setPassword(database, newPassword);

        res.status(200).send({ message: 'Password Successfully Updated' });
    } catch(errorCode) {
        const error = errorIdentify(errorCode);
        res.status(error.status).json({error: error.message});
    }
})

app.post('/api/owner/edit/phone', async (req,res) => {
    const authen = req.headers.authorization;
    if (authen === undefined) {
        return res.send("Server Unavailable");
    }

    const encodedCredential = authen.split(" ")[1];
    const decodedCredential = atob(encodedCredential);

    const authenParts = decodedCredential.split(":");
    const restaurantEmail = authenParts[0];
    const restaurantPassword = authenParts[1];

    const newPhone = req.body.newPhone;

    if (newPhone === undefined) {
        return res.send("Wrong Parameter");
    }

    try {
        const authenticationResult = await Restaurant.authenticateOwner(database, restaurantEmail, restaurantPassword);

        const aRestaurant = createRestaurantObject(authenticationResult);

        await aRestaurant.setPhone(database, newPhone);

        res.status(200).send({ message: 'Phone Successfully Updated' });
    } catch(errorCode) {
        const error = errorIdentify(errorCode);
        res.status(error.status).json({error: error.message});
    }
})

app.get('/api/owner/menu', async (req, res) => {
    const authen = req.headers.authorization;
    if (authen === undefined) {
        return res.send("Server Unavailable");
    }

    const encodedCredential = authen.split(" ")[1];
    const decodedCredential = atob(encodedCredential);

    const authenParts = decodedCredential.split(":");
    const restaurantEmail = authenParts[0];
    const restaurantPassword = authenParts[1];

    try {
        const authenticationResult = await Restaurant.authenticateOwner(database, restaurantEmail, restaurantPassword);

        const aRestaurant = createRestaurantObject(authenticationResult);

        const restaurantName = aRestaurant.restaurantName;

        const restaurantItems = await Restaurant.getRestaurantItems(database, restaurantName);

        res.json(restaurantItems);
    } catch(errorCode) {
        const error = errorIdentify(errorCode);
        res.status(error.status).json({error: error.message});
    }
})

app.post('/api/owner/edit/menu/add', async (req,res) => {
    const authen = req.headers.authorization;
    if (authen === undefined) {
        return res.send("Server Unavailable");
    }

    const encodedCredential = authen.split(" ")[1];
    const decodedCredential = atob(encodedCredential);

    const authenParts = decodedCredential.split(":");
    const restaurantEmail = authenParts[0];
    const restaurantPassword = authenParts[1];

    const itemName = req.body.itemName;
    const itemPrice = req.body.itemPrice;

    if (itemName === undefined || itemPrice === undefined || isNaN(itemPrice) === true) {
        return res.send("Wrong Parameter");
    }
    
    try {
        const authenticationResult = await Restaurant.authenticateOwner(database, restaurantEmail, restaurantPassword);

        const aRestaurant = createRestaurantObject(authenticationResult);

        await aRestaurant.addItem(database, itemName, parseFloat(itemPrice));

        res.status(200).send({ message: 'Item Successfully Added' });
    } catch(errorCode) {
        const error = errorIdentify(errorCode);
        res.status(error.status).json({error: error.message});
    }
})

app.post('/api/owner/edit/menu/del', async (req,res) => {
    const authen = req.headers.authorization;
    if (authen === undefined) {
        return res.send("Server Unavailable");
    }

    const encodedCredential = authen.split(" ")[1];
    const decodedCredential = atob(encodedCredential);

    const authenParts = decodedCredential.split(":");
    const restaurantEmail = authenParts[0];
    const restaurantPassword = authenParts[1];

    const itemName = req.body.itemName;

    if (itemName === undefined) {
        return res.send("Wrong Parameter");
    }
    
    try {
        const authenticationResult = await Restaurant.authenticateOwner(database, restaurantEmail, restaurantPassword);

        const aRestaurant = createRestaurantObject(authenticationResult);

        await aRestaurant.deleteItem(database, itemName);

        res.status(200).send({ message: 'Item Successfully Deleted' });
    } catch(errorCode) {
        const error = errorIdentify(errorCode);
        res.status(error.status).json({error: error.message});
    }
})

app.post('/api/owner/edit/item', async (req,res) => {
    const authen = req.headers.authorization;
    if (authen === undefined) {
        return res.send("Server Unavailable");
    }

    const encodedCredential = authen.split(" ")[1];
    const decodedCredential = atob(encodedCredential);

    const authenParts = decodedCredential.split(":");
    const restaurantEmail = authenParts[0];
    const restaurantPassword = authenParts[1];

    const newItemName = req.body.newItemName;
    const oldItemName = req.body.oldItemName;
    const itemPrice = req.body.itemPrice;

    if (newItemName === undefined || itemPrice === undefined || isNaN(itemPrice) === true || oldItemName === undefined) {
        return res.send("Wrong Parameter");
    }
    
    try {
        const authenticationResult = await Restaurant.authenticateOwner(database, restaurantEmail, restaurantPassword);

        const aRestaurant = createRestaurantObject(authenticationResult);

        await aRestaurant.editItem(database, newItemName, parseFloat(itemPrice), oldItemName);

        res.status(200).send({ message: 'Item Successfully Edited' });
    } catch(errorCode) {
        const error = errorIdentify(errorCode);
        res.status(error.status).json({error: error.message});
    }
})

app.get('/api/owner/orders/incoming', async (req,res) => {
    const authen = req.headers.authorization;
    if (authen === undefined) {
        return res.send("Server Unavailable");
    }

    const encodedCredential = authen.split(" ")[1];
    const decodedCredential = atob(encodedCredential);

    const authenParts = decodedCredential.split(":");
    const restaurantEmail = authenParts[0];
    const restaurantPassword = authenParts[1];
    
    try {
        const authenticationResult = await Restaurant.authenticateOwner(database, restaurantEmail, restaurantPassword);

        const aRestaurant = createRestaurantObject(authenticationResult);

        const incomingOrders = await aRestaurant.getIncomingOrders(database);

        res.json(incomingOrders);
    } catch(errorCode) {
        const error = errorIdentify(errorCode);
        res.status(error.status).json({error: error.message});
    }
})

app.get('/api/owner/orders/active', async (req,res) => {
    const authen = req.headers.authorization;
    if (authen === undefined) {
        return res.send("Server Unavailable");
    }

    const encodedCredential = authen.split(" ")[1];
    const decodedCredential = atob(encodedCredential);

    const authenParts = decodedCredential.split(":");
    const restaurantEmail = authenParts[0];
    const restaurantPassword = authenParts[1];
    
    try {
        const authenticationResult = await Restaurant.authenticateOwner(database, restaurantEmail, restaurantPassword);

        const aRestaurant = createRestaurantObject(authenticationResult);

        const activeOrders = await aRestaurant.getActiveOrders(database);

        res.json(activeOrders);
    } catch(errorCode) {
        const error = errorIdentify(errorCode);
        res.status(error.status).json({error: error.message});
    }
})

app.get('/api/owner/orders/history', async (req,res) => {
    const authen = req.headers.authorization;
    if (authen === undefined) {
        return res.send("Server Unavailable");
    }

    const encodedCredential = authen.split(" ")[1];
    const decodedCredential = atob(encodedCredential);

    const authenParts = decodedCredential.split(":");
    const restaurantEmail = authenParts[0];
    const restaurantPassword = authenParts[1];
    
    try {
        const authenticationResult = await Restaurant.authenticateOwner(database, restaurantEmail, restaurantPassword);

        const aRestaurant = createRestaurantObject(authenticationResult);

        const pastOrders = await aRestaurant.getPastOrders(database);

        res.json(pastOrders);
    } catch(errorCode) {
        const error = errorIdentify(errorCode);
        res.status(error.status).json({error: error.message});
    }
})

app.get('/api/owner/order', async (req,res) => {
    const authen = req.headers.authorization;
    if (authen === undefined) {
        return res.send("Server Unavailable");
    }

    const encodedCredential = authen.split(" ")[1];
    const decodedCredential = atob(encodedCredential);

    const authenParts = decodedCredential.split(":");
    const restaurantEmail = authenParts[0];
    const restaurantPassword = authenParts[1];

    const orderCode = req.query.oc;

    if (orderCode === undefined) {
        return res.send("Wrong Parameter");
    }
    
    try {
        const authenticationResult = await Restaurant.authenticateOwner(database, restaurantEmail, restaurantPassword);

        const aRestaurant = createRestaurantObject(authenticationResult);

        const order = await aRestaurant.viewOrder(database, orderCode);

        res.json(order);
    } catch(errorCode) {
        const error = errorIdentify(errorCode);
        res.status(error.status).json({error: error.message});
    }
})

app.post('/api/owner/order/accept', async (req,res) => {
    const authen = req.headers.authorization;
    if (authen === undefined) {
        return res.send("Server Unavailable");
    }

    const encodedCredential = authen.split(" ")[1];
    const decodedCredential = atob(encodedCredential);

    const authenParts = decodedCredential.split(":");
    const restaurantEmail = authenParts[0];
    const restaurantPassword = authenParts[1];

    const orderCode = req.body.oc;

    if (orderCode === undefined) {
        return res.send("Wrong Parameter");
    }
    
    try {
        const authenticationResult = await Restaurant.authenticateOwner(database, restaurantEmail, restaurantPassword);

        const aRestaurant = createRestaurantObject(authenticationResult);

        await aRestaurant.restaurantAcceptOrder(database, orderCode);

        res.status(200).send({ message: 'Order Successfully Accepted' });
    } catch(errorCode) {
        const error = errorIdentify(errorCode);
        res.status(error.status).json({error: error.message});
    }
})

app.post('/api/owner/order/reject', async (req,res) => {
    const authen = req.headers.authorization;
    if (authen === undefined) {
        return res.send("Server Unavailable");
    }

    const encodedCredential = authen.split(" ")[1];
    const decodedCredential = atob(encodedCredential);

    const authenParts = decodedCredential.split(":");
    const restaurantEmail = authenParts[0];
    const restaurantPassword = authenParts[1];

    const orderCode = req.body.oc;
    const rejectReason = req.body.rejectReason;

    if (orderCode === undefined || rejectReason === undefined) {
        return res.send("Wrong Parameter");
    }
    
    try {
        const authenticationResult = await Restaurant.authenticateOwner(database, restaurantEmail, restaurantPassword);

        const aRestaurant = createRestaurantObject(authenticationResult);

        await aRestaurant.restaurantRejectOrder(database, orderCode, rejectReason);

        res.status(200).send({ message: 'Order Successfully Rejected' });
    } catch(errorCode) {
        const error = errorIdentify(errorCode);
        res.status(error.status).json({error: error.message});
    }
})

app.get('/api/owner/revenue', async (req,res) => {
    const authen = req.headers.authorization;
    if (authen === undefined) {
        return res.send("Server Unavailable");
    }

    const encodedCredential = authen.split(" ")[1];
    const decodedCredential = atob(encodedCredential);

    const authenParts = decodedCredential.split(":");
    const restaurantEmail = authenParts[0];
    const restaurantPassword = authenParts[1];

    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    if (startDate === undefined || endDate === undefined) {
        return res.send("Wrong Parameter");
    }

    if (isNaN(Date.parse(startDate)) === true || isNaN(Date.parse(endDate)) === true) {
        return res.send("Wrong Format");
    }
    
    try {
        const authenticationResult = await Restaurant.authenticateOwner(database, restaurantEmail, restaurantPassword);

        const aRestaurant = createRestaurantObject(authenticationResult);

        const revenueStatusSummary = await aRestaurant.viewRevenueStatus(database, startDate, endDate);

        res.json(revenueStatusSummary);
    } catch(errorCode) {
        const error = errorIdentify(errorCode);
        res.status(error.status).json({error: error.message});
    }
})

app.listen(4000, function() {
    console.log("Listening on port 4000");
});