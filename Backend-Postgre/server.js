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
        res.json(result.rows[0]); // Send the first result row
    } catch (err) {
        console.error('Error fetching user data:', err);
        res.status(500).send('Internal Server Error');
    }
});

// Endpoint to get all products
// app.get('/api/products', async (req, res) => {
//     try {
//         const result = await pool.query('SELECT * FROM product');
//         res.json(result.rows);
//     } catch (err) {
//         console.error('Error fetching products:', err);
//         res.status(500).send('Internal Server Error');
//     }
// });

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


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
