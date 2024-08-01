import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Cart.css';

const Cart = ({ userId }) => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCartItems = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/cart/${userId}`);
                setCartItems(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching cart items:', error);
                setLoading(false);
            }
        };

        fetchCartItems();
    }, [userId]);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (cartItems.length === 0) {
        return (
            <div className="cart-container">
                <div className="inner-card">
                    <h2>Shopping Cart</h2>
                    <p>Your cart is empty.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="cart-container">
            <div className="inner-card">
                <h2>Shopping Cart</h2>
                <ul>
                    {cartItems.map((item) => (
                        <li key={item.product_id}>
                            <h3>{item.item_name}</h3>
                            <p>Brand: {item.brand}</p>
                            <p>Category: {item.category}</p>
                            <p>Size: {item.item_size}</p>
                            <p>Price: ${item.standard_price}</p>
                            <p>Quantity: {item.quantity}</p>
                            <p>Total Price: ${item.total_price}</p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default Cart;
