const Customer = require('./class/Customer.js');
const Order = require('./class/Order.js');

const mysql = require('mysql2');

const database = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'ngaymai123',
    database: 'FOOD4U',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

/*Order.createOrder(database, 'CC1R1', 1, 'Viet Thai Nguyen', '0969696969', 'OC1R1T20240312182430', 1, 'Ur Mom House', 'Restaurant 1 Courier', '01234567890', '2024-03-12', 420.69)
.then(() => {
    console.log("Success");
})
.catch(errorCode => {
    console.log(errorCode);
})*/

/*const aCustomer = new Customer(1);
aCustomer.createCustomerOrder(database, 'Viet Thai Nguyen', '0969696969', 'Ur Mom House', 'Restaurant 1 Courier', '01234567890', 420.69)
.then(() => {
    console.log("Success");
})
.catch((errorCode) => {
    console.log(errorCode);
    console.log("Fail");
})*/

/*const aCustomer = new Customer(1);
aCustomer.customerViewOrder(database, 'OC1R1T20240313213934')
.then(result => {
    console.log(result);
})
.catch(errorCode => {
    console.log(errorCode);
})*/

/*const orderRating = 4;
const orderReview = "Goodjob!";

const aCustomer = new Customer(1);
aCustomer.customerReviewOrder(database, 'OC1R1T20240313213934', parseInt(orderRating), orderReview)
.then(result => {
    console.log("Success");
})
.catch(errorCode => {
    console.log(errorCode);
})*/

/*const aCustomer = new Customer(1);
aCustomer.customerReportOrder(database, 'OC1R1T20240313213934')
.then(result => {
    console.log("Success");
})
.catch(errorCode => {
    console.log(errorCode);
})*/

const aCustomer = new Customer(1);
aCustomer.customerViewActiveOrder(database)
.then(result => {
    console.log(result);
})
.catch(errorCode => {
    console.log(errorCode);
})