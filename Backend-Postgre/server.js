const express = require('express');
const app = express();
const port = process.env.PORT || 5000;
const { Pool } = require('pg');
const cors = require('cors');

app.use(cors());
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'ecommerce',
    password: 'Salmasafe1',
    port: 5432,
});

// Endpoint to get all users
app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT user_id, user_name FROM app_user');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Endpoint to get user, address, and credit card information
app.get('/api/user/:userId', async (req, res) => {
    const userId = parseInt(req.params.userId);
    try {
        const userQuery = `
            SELECT 
                app_user.user_name, 
                app_user.password, 
                address.street, 
                address.city, 
                address.state, 
                address.postal_code, 
                address.country,
                creditcard.card_number, 
                creditcard.pin, 
                creditcard.expiration_date
            FROM 
                app_user
            LEFT JOIN 
                address ON app_user.u_address_id = address.address_id
            LEFT JOIN 
                creditcard ON app_user.user_id = creditcard.c_user_id
            WHERE 
                app_user.user_id = $1
        `;
        const result = await pool.query(userQuery, [userId]);
        const user = result.rows[0];
        user.addresses = user.addresses || []; // Ensure addresses is an array
        res.json(user);
    } catch (err) {
        console.error('Error fetching user data:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Endpoint to get all products with optional search filter
app.get('/api/products', async (req, res) => {
    const search = req.query.search || '';
    try {
        const result = await pool.query(`
            SELECT * FROM product
            WHERE category ILIKE $1
               OR brand ILIKE $1
               OR item_name ILIKE $1
        `, [`%${search}%`]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Endpoint to add an address
app.post('/api/address', async (req, res) => {
    const { address_type, street, city, state, postal_code, country, user_id } = req.body;
    try {
        const result = await pool.query(`
            INSERT INTO address (address_type, street, city, state, postal_code, country)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `, [address_type, street, city, state, postal_code, country]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error adding address:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Endpoint to delete an address
app.delete('/api/address/:addressId', async (req, res) => {
    const addressId = parseInt(req.params.addressId);
    try {
        await pool.query('DELETE FROM address WHERE address_id = $1', [addressId]);
        res.status(204).send(); // No Content
    } catch (err) {
        console.error('Error deleting address:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Endpoint to add a credit card
app.post('/api/creditcard', async (req, res) => {
    const { userId, card_number, pin, expiration_date, address_id } = req.body;

    try {
        if (!userId || !card_number || !pin || !expiration_date || !address_id) {
            return res.status(400).send('Bad Request: Missing required fields');
        }

        const result = await pool.query(`
            INSERT INTO creditcard (c_user_id, card_number, pin, expiration_date, c_address_id)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `, [userId, card_number, pin, expiration_date, address_id]);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error adding credit card:', err);
        res.status(500).send(`Internal Server Error: ${err.message}`);
    }
});

// display credit cards that match userID
app.get('/api/creditcards/:userId', async (req, res) => {
    const { userId } = req.params;
    
    try {
        const result = await pool.query('SELECT * FROM creditcard WHERE c_user_id = $1', [userId]);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching credit card data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Endpoint to add an item to the shopping cart
app.post('/api/cart', async (req, res) => {
    const { userId, productId, quantity } = req.body;

    try {
        const query = `
            WITH upsert AS (
                UPDATE ShoppingCart
                SET quantity = quantity + $3
                WHERE user_id = $1 AND product_id = $2
                RETURNING *
            )
            INSERT INTO ShoppingCart (user_id, product_id, quantity)
            SELECT $1, $2, $3
            WHERE NOT EXISTS (SELECT * FROM upsert);
        `;
        await pool.query(query, [userId, productId, quantity]);
        res.status(201).send('Item added to cart');
    } catch (err) {
        console.error('Error adding item to cart:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Endpoint to remove an item from the shopping cart
app.delete('/api/cart', async (req, res) => {
    const { userId, productId } = req.body;

    try {
        await pool.query(`
            DELETE FROM ShoppingCart
            WHERE user_id = $1 AND product_id = $2
        `, [userId, productId]);
        res.status(204).send(); // No Content
    } catch (err) {
        console.error('Error removing item from cart:', err);
        res.status(500).send('Internal Server Error');
    }
});


// Endpoint to update the quantity of an item in the shopping cart
app.put('/api/cart', async (req, res) => {
    const { userId, productId, quantity } = req.body;

    try {
        if (quantity <= 0) {
            // Remove the item if quantity is less than or equal to 0
            await pool.query(`
                DELETE FROM ShoppingCart
                WHERE user_id = $1 AND product_id = $2
            `, [userId, productId]);
        } else {
            // Update or insert the item with the new quantity
            await pool.query(`
                WITH upsert AS (
                    UPDATE ShoppingCart
                    SET quantity = $3
                    WHERE user_id = $1 AND product_id = $2
                    RETURNING *
                )
                INSERT INTO ShoppingCart (user_id, product_id, quantity)
                SELECT $1, $2, $3
                WHERE NOT EXISTS (SELECT * FROM upsert);
            `, [userId, productId, quantity]);
        }
        res.status(200).send('Item quantity updated');
    } catch (err) {
        console.error('Error updating item quantity in cart:', err);
        res.status(500).send('Internal Server Error');
    }
});


// Endpoint to view the shopping cart for a specific user
app.get('/api/cart/:userId', async (req, res) => {
    const userId = parseInt(req.params.userId);

    try {
        const result = await pool.query(`
            SELECT
                ShoppingCart.product_id,
                Product.item_name,
                Product.brand,
                Product.category,
                Product.item_size,
                Product.standard_price,
                ShoppingCart.quantity,
                (Product.standard_price * ShoppingCart.quantity) AS total_price
            FROM
                ShoppingCart
            JOIN
                Product ON ShoppingCart.product_id = Product.product_id
            WHERE
                ShoppingCart.user_id = $1;
        `, [userId]);

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching shopping cart:', err);
        res.status(500).send('Internal Server Error');
    }
});


// Endpoint to submit an order
app.post('/api/order', async (req, res) => {
    const { userId, creditCardId, deliveryType, deliveryPrice, deliverDate } = req.body;

    try {
        // Begin transaction
        await pool.query('BEGIN');

        // Get items from the shopping cart
        const cartResult = await pool.query(`
            SELECT
                product_id,
                quantity
            FROM
                ShoppingCart
            WHERE
                user_id = $1
        `, [userId]);

        // Check if cart is empty
        if (cartResult.rows.length === 0) {
            await pool.query('ROLLBACK');
            return res.status(400).send('Shopping cart is empty');
        }

        // Iterate through cart items and create orders
        for (const item of cartResult.rows) {
            const { product_id, quantity } = item;

            // Insert the order
            const orderResult = await pool.query(`
                INSERT INTO Product_Order (
                    o_product_id, 
                    quantity, 
                    date_issued, 
                    status, 
                    o_credit_id, 
                    delivery_type, 
                    delivery_price, 
                    ship_date, 
                    deliver_date
                )
                VALUES (
                    $1, 
                    $2, 
                    CURRENT_DATE, 
                    'Pending', 
                    $3, 
                    $4, 
                    $5, 
                    CURRENT_DATE, 
                    $6
                )
                RETURNING order_id;
            `, [product_id, quantity, creditCardId, deliveryType, deliveryPrice, deliverDate]);

            // Get the new order ID
            const orderId = orderResult.rows[0].order_id;

            // Update the warehouse inventory (assuming a function to get warehouse info)
            await pool.query(`
                UPDATE Warehouse
                SET stock = stock - $1
                WHERE warehouse_id = (
                    SELECT p_warehouse_id FROM Product WHERE product_id = $2
                )
            `, [quantity, product_id]);
        }

        // Clear the shopping cart
        await pool.query(`
            DELETE FROM ShoppingCart
            WHERE user_id = $1
        `, [userId]);

        // Commit transaction
        await pool.query('COMMIT');

        res.status(201).send('Order submitted successfully');
    } catch (err) {
        console.error('Error submitting order:', err);
        await pool.query('ROLLBACK');
        res.status(500).send('Internal Server Error');
    }
});


// Endpoint to get details of a specific order
app.get('/api/order/:orderId', async (req, res) => {
    const orderId = parseInt(req.params.orderId);

    try {
        const result = await pool.query(`
            SELECT
                Product_Order.order_id,
                Product_Order.date_issued,
                Product_Order.status,
                Product_Order.delivery_type,
                Product_Order.delivery_price,
                Product_Order.ship_date,
                Product_Order.deliver_date,
                Product.product_id,
                Product.item_name,
                Product.brand,
                Product.category,
                Product.item_size,
                Product.standard_price,
                Product_Order.quantity,
                (Product.standard_price * Product_Order.quantity) AS total_price
            FROM
                Product_Order
            JOIN
                Product ON Product_Order.o_product_id = Product.product_id
            WHERE
                Product_Order.order_id = $1;
        `, [orderId]);

        if (result.rows.length === 0) {
            return res.status(404).send('Order not found');
        }

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching order details:', err);
        res.status(500).send('Internal Server Error');
    }
});


// Endpoint to update credit card information
app.put('/api/creditcard/:creditId', async (req, res) => {
    const creditId = parseInt(req.params.creditId);
    const { card_number, pin, expiration_date, address_id } = req.body;

    if (!card_number || !pin || !expiration_date || !address_id) {
        return res.status(400).send('Bad Request: Missing required fields');
    }

    try {
        const result = await pool.query(`
            UPDATE creditcard
            SET
                card_number = $1,
                pin = $2,
                expiration_date = $3,
                c_address_id = $4
            WHERE
                credit_id = $5
            RETURNING *;
        `, [card_number, pin, expiration_date, address_id, creditId]);

        if (result.rows.length === 0) {
            return res.status(404).send('Credit card not found');
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating credit card:', err);
        res.status(500).send('Internal Server Error');
    }
});


// Endpoint to delete a credit card
app.delete('/api/creditcard/:creditId', async (req, res) => {
    const creditId = parseInt(req.params.creditId);

    try {
        const result = await pool.query('DELETE FROM creditcard WHERE credit_id = $1', [creditId]);

        if (result.rowCount === 0) {
            return res.status(404).send('Credit card not found');
        }

        res.status(204).send(); // No Content
    } catch (err) {
        console.error('Error deleting credit card:', err);
        res.status(500).send('Internal Server Error');
    }
});


// Endpoint to update address information
app.put('/api/address/:addressId', async (req, res) => {
    const addressId = parseInt(req.params.addressId);
    const { address_type, street, city, state, postal_code, country } = req.body;

    if (!address_type || !street || !city || !state || !postal_code || !country) {
        return res.status(400).send('Bad Request: Missing required fields');
    }

    try {
        const result = await pool.query(`
            UPDATE address
            SET
                address_type = $1,
                street = $2,
                city = $3,
                state = $4,
                postal_code = $5,
                country = $6
            WHERE
                address_id = $7
            RETURNING *;
        `, [address_type, street, city, state, postal_code, country, addressId]);

        if (result.rows.length === 0) {
            return res.status(404).send('Address not found');
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating address:', err);
        res.status(500).send('Internal Server Error');
    }
});


// Endpoint to delete an address
app.delete('/api/address/:addressId', async (req, res) => {
    const addressId = parseInt(req.params.addressId);

    try {
        const result = await pool.query('DELETE FROM address WHERE address_id = $1', [addressId]);

        if (result.rowCount === 0) {
            return res.status(404).send('Address not found');
        }

        res.status(204).send(); // No Content
    } catch (err) {
        console.error('Error deleting address:', err);
        res.status(500).send('Internal Server Error');
    }
});


// Endpoint to add a new product
app.post('/api/product', async (req, res) => {
    const { category, brand, item_name, item_size, description, p_warehouse_id, standard_price } = req.body;

    if (!category || !brand || !item_name || !item_size || !description || !p_warehouse_id || !standard_price) {
        return res.status(400).send('Bad Request: Missing required fields');
    }

    try {
        const result = await pool.query(`
            INSERT INTO product (
                category, 
                brand, 
                item_name, 
                item_size, 
                description, 
                p_warehouse_id, 
                standard_price
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `, [category, brand, item_name, item_size, description, p_warehouse_id, standard_price]);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error adding product:', err);
        res.status(500).send('Internal Server Error');
    }
});


// Endpoint to update product information
app.put('/api/product/:productId', async (req, res) => {
    const productId = parseInt(req.params.productId);
    const { category, brand, item_name, item_size, description, p_warehouse_id, standard_price } = req.body;

    if (!category || !brand || !item_name || !item_size || !description || !p_warehouse_id || !standard_price) {
        return res.status(400).send('Bad Request: Missing required fields');
    }

    try {
        const result = await pool.query(`
            UPDATE product
            SET 
                category = $1, 
                brand = $2, 
                item_name = $3, 
                item_size = $4, 
                description = $5, 
                p_warehouse_id = $6, 
                standard_price = $7
            WHERE 
                product_id = $8
            RETURNING *;
        `, [category, brand, item_name, item_size, description, p_warehouse_id, standard_price, productId]);

        if (result.rowCount === 0) {
            return res.status(404).send('Product not found');
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).send('Internal Server Error');
    }
});


// Endpoint to delete a product
app.delete('/api/product/:productId', async (req, res) => {
    const productId = parseInt(req.params.productId);

    try {
        // Attempt to delete the product
        const result = await pool.query('DELETE FROM product WHERE product_id = $1', [productId]);

        // Check if any rows were affected (i.e., if the product existed)
        if (result.rowCount === 0) {
            return res.status(404).send('Product not found');
        }

        // Successfully deleted
        res.status(204).send(); // No Content
    } catch (err) {
        console.error('Error deleting product:', err);
        res.status(500).send('Internal Server Error');
    }
});


// Endpoint to add stock to a warehouse
app.post('/api/warehouse/stock', async (req, res) => {
    const { productId, warehouseId, quantity } = req.body;

    // Validate input
    if (!productId || !warehouseId || quantity === undefined || quantity <= 0) {
        return res.status(400).send('Bad Request: Missing or invalid fields');
    }

    try {
        // Update stock quantity for the specified product and warehouse
        const result = await pool.query(`
            UPDATE product
            SET stock_quantity = stock_quantity + $1
            WHERE product_id = $2 AND p_warehouse_id = $3
            RETURNING *
        `, [quantity, productId, warehouseId]);

        // Check if any rows were affected
        if (result.rowCount === 0) {
            return res.status(404).send('Product or warehouse not found');
        }

        // Successfully updated
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error adding stock to warehouse:', err);
        res.status(500).send('Internal Server Error');
    }
});



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
