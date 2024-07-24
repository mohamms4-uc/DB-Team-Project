CREATE DATABASE ecommerce;


create Table Address(
	address_ID int,
	address_type varchar(8),
	street varchar(10),
	city varchar(10),
	state varchar (8),
	postal_code int,
	country varchar (10),
	primary key (address_ID)
);


create Table App_User(
	user_ID int,
	user_name varchar(12),
	u_address_ID int,
	password varchar(255);
	primary key (user_ID),
	foreign key (u_address_ID) references Address(address_ID)
);


create Table Customer(
	customer_ID int,
	c_user_ID int,
	account_balance double precision,
	primary key (customer_ID),
	foreign key (c_user_ID) references App_User(user_ID)
);


create Table Staff(
	staff_ID int,
	s_user_ID int,
	salary double precision,
	jobtitle varchar(20),
	primary key (staff_ID),
	foreign key (s_user_ID) references App_User(user_ID)
);


create Table CreditCard(
	credit_ID int,
	c_user_ID int,
	c_address_ID int,
	card_number int,
	pin int,
	expiration_date date,
	primary key (credit_ID),
	foreign key (c_user_ID) references App_User(user_ID),
	foreign key (c_address_ID) references Address(address_ID)
);


create Table Warehouse(
	warehouse_ID int,
	warehouse_name varchar(10),
	w_address_ID int,
	capacity int,
	primary key (warehouse_ID),
	foreign key (w_address_ID) references Address(address_ID)
);


create Table Supplier(
	supplier_ID int,
	supplier_name varchar(10),
	s_product_ID int,
	s_address_ID int,
	supplier_price double precision,
	primary key (supplier_ID),
	foreign key (s_product_ID) references Product(product_ID),
	foreign key (s_address_ID) references Address(address_ID)
);


create Table Product(
	product_ID int,
	category varchar(10),
	brand varchar(12),
	item_name varchar(15),
	item_size int,
	description varchar(30),
	p_warehouse_ID int,
	standard_price double precision,
	primary key (product_ID),
	foreign key (p_warehouse_ID) references Warehouse(warehouse_ID)
);



create Table Product_Order(
	order_ID int,
	o_product_ID int,
	quantity int,
	date_issued date,
	status varchar(10),
	o_credit_ID int,
	
	delivery_type varchar(10),
	delivery_price double precision,
	ship_date date,
	deliver_date date,
	
	primary key (order_ID),
	foreign key (o_credit_ID) references CreditCard(credit_ID),
	foreign key (o_product_ID) references Product(product_ID)
);
	
	
	
	