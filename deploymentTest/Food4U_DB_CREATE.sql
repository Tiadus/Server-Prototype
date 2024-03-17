CREATE TABLE IF NOT EXISTS CUSTOMER (
	customerCode int auto_increment not null,
    customerEmail varchar(225) not null,
    customerName varchar(225) not null,
    customerPhone varchar(225) not null,
    membershipEnd date null,
    isActive bool not null,
    constraint CUSTOMER_PK primary key (customerCode),
    constraint CUSTOMER_CK1 unique(customerEmail)
);
CREATE TABLE IF NOT EXISTS CUSTOMER_AUTHENTICATION (
    customerEmail varchar(225) not null,
    customerPassword varchar(225) not null,
    constraint CUSTOMER_AUTHENTICATION_PK1 primary key (customerEmail),
    constraint CUSTOMER_AUTHENTICATION_FK1 foreign key (customerEmail) references CUSTOMER(customerEmail) on update cascade on delete cascade
);
CREATE TABLE IF NOT EXISTS CUSTOMER_PAYMENT (
    paymentCode int auto_increment not null,
	customerCode int not null,
    cardNumber varchar(255) not null,
    cardOwner varchar(255) not null,
    cardExpMonth int not null,
    cardExpYear int not null,
    constraint CUSTOMER_PAYMENT_PK primary key (paymentCode),
    constraint CUSTOMER_PAYMENT_CK unique(customerCode, cardNumber),
    constraint CUSTOMER_PAYMENT_FK foreign key (customerCode) references CUSTOMER(customerCode) on delete cascade
);
CREATE TABLE IF NOT EXISTS RESTAURANT (
	restaurantCode int auto_increment not null,
    restaurantEmail varchar(225) not null,
    restaurantName varchar(255) not null,
    restaurantPhone varchar(255) not null,
    restaurantABN varchar(255) not null,
    restaurantBanking varchar(255) not null,
    restaurantLocation varchar(255),
    restaurantLat decimal(10,7) not null,
    restaurantLon decimal(10,7) not null,
    restaurantTotalRating int not null,
    restaurantTotalOrder int not null,
    restaurantIMG varchar(255) not null,
    isActive bool not null,
    constraint RESTAURANT_PK primary key (restaurantCode),
    constraint RESTAURANT_CK1 unique (restaurantEmail),
    constraint RESTAURANT_CK2 unique (restaurantName)
);
CREATE TABLE IF NOT EXISTS RESTAURANT_AUTHENTICATION (
	restaurantEmail varchar(225) not null,
    restaurantPassword varchar(225) not null,
    constraint RESTAURANT_AUTHENTICATION_PK1 primary key (restaurantEmail),
    constraint RESTAURANT_AUTHENTICATION_FK1 foreign key (restaurantEmail) references RESTAURANT(restaurantEmail) on update cascade
);
CREATE TABLE IF NOT EXISTS RESTAURANT_ITEM (
	restaurantCode int not null,
    itemName varchar(225) not null,
    itemPrice decimal(10,2) not null,
    itemIMG varchar(225) not null,
    constraint RESTAURANT_ITEM_PK primary key (restaurantCode, itemName),
    constraint RESTAURANT_ITEM_FK1 foreign key (restaurantCode) references RESTAURANT(restaurantCode) on delete cascade
);
CREATE TABLE IF NOT EXISTS CUSTOMER_CART (
	customerCode int not null,
    restaurantCode int not null,
    cartCode varchar(225) not null,
    constraint CUSTOMER_CART_PK primary key (cartCode),
    constraint CUSTOMER_CART_FK1 foreign key (customerCode) references CUSTOMER(customerCode),
    constraint CUSTOMER_CART_FK2 foreign key (restaurantCode) references RESTAURANT(restaurantCode)
);
CREATE TABLE IF NOT EXISTS CART_ITEM (
	cartCode varchar(225) not null,
    itemName varchar(225) not null,
    itemPrice decimal(10,2) not null,
    itemQuantity int not null,
    constraint CART_ITEM_PK primary key (cartCode, itemName),
    constraint CART_ITEM_FK1 foreign key (cartCode) references CUSTOMER_CART(cartCode) on delete cascade
);
CREATE TABLE IF NOT EXISTS APP_ORDER (
	customerCode int,
    recipientName varchar(100) not null,
    recipientPhone varchar(50) not null,
    orderCode varchar(50) not null,
    restaurantCode int not null,
    orderStatus int not null,
    orderLocation varchar(225) not null,
    courierName varchar(100) null,
    courierPhone varchar(50) null,
    orderReview varchar(225) null,
    orderRating int null,
    orderDate date not null,
    orderCost decimal(10,2) not null,
    rejectReason varchar(225) null,
    constraint APP_ORDER_PK primary key (orderCode),
    constraint APP_ORDER_FK1 foreign key (customerCode) references CUSTOMER(customerCode),
    constraint APP_ORDER_FK2 foreign key (restaurantCode) references RESTAURANT(restaurantCode)
);
CREATE TABLE IF NOT EXISTS ORDER_ITEM (
	orderCode varchar(225) not null,
	itemName varchar(225) not null,
    itemPrice decimal(10,2) not null,
    itemQuantity int not null,
    constraint ORDER_ITEM_PK primary key (orderCode, itemName)
);
CREATE TABLE IF NOT EXISTS CATEGORY (
	categoryCode int auto_increment not null,
    categoryName varchar(225) not null,
    categoryIMG varchar(225) not null,
    constraint CATEGORY_PK primary key (categoryCode),
    constraint CATEGORY_CK1 unique (categoryName)
);
CREATE TABLE IF NOT EXISTS CATEGORY_RESTAURANT (
	categoryCode int not null,
    restaurantCode int not null,
    constraint CATEGORY_RESTAURANT_FK1 foreign key (categoryCode) references CATEGORY(categoryCode),
    constraint CATEGORY_RESTAURANT_FK2 foreign key (restaurantCode) references RESTAURANT(restaurantCode)
);