import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Cart.css';
import CheckoutModal from './CheckoutModal';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [userId, setUserId] = useState(1);
    const [cartTotal, setCartTotal] = useState(0);
    const [modalShow, setModalShow] = useState(false);

    useEffect(() => {
        const fetchCartItems = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/cart/${userId}`);
                const items = response.data;
                setCartItems(items);

                const total = items.reduce((acc, item) => acc + (item.standard_price * item.quantity), 0);
                setCartTotal(total);
            } catch (error) {
                console.error('Error fetching cart items:', error);
            }
        };

        fetchCartItems();
    }, [userId]);

    const handleCheckout = () => setModalShow(true);

    const handleRemoveItem = async (productId) => {
        try {
            await axios.put(`http://localhost:5000/api/cart/removeOne`, { userId, productId });
            setCartItems(cartItems.map(item => 
                item.product_id === productId 
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            ).filter(item => item.quantity > 0));
        } catch (error) {
            console.error('Error removing item from cart:', error);
        }
    };
    
    

    return (
        <div className="cart-container">
            <div className="inner-card">
                <h2>Shopping Cart</h2>
                {cartItems.length === 0 ? (
                    <p>Your cart is empty.</p>
                ) : (
                    <>
                        <table className="cart-table">
                            <thead>
                                <tr>
                                    <th>Item Name</th>
                                    <th>Category</th>
                                    <th>Brand</th>
                                    <th>Size</th>
                                    <th>Quantity</th>
                                    <th>Price</th>
                                    <th>Total</th>
                                    <th>Remove</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cartItems.map(item => (
                                    <tr key={item.product_id}>
                                        <td>{item.item_name}</td>
                                        <td>{item.category}</td>
                                        <td>{item.brand}</td>
                                        <td>{item.item_size}</td>
                                        <td>{item.quantity}</td>
                                        <td>${item.standard_price.toFixed(2)}</td>
                                        <td>${(item.standard_price * item.quantity).toFixed(2)}</td>
                                        <td>
                                            <button
                                                className="remove-button"
                                                onClick={() => handleRemoveItem(item.product_id)}
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="cart-summary">
                            <span className="cart-total">Cart Total: ${cartTotal.toFixed(2)}</span>
                            <button className="checkout-button" onClick={handleCheckout}>Check Out</button>
                        </div>
                    </>
                )}
            </div>
            <CheckoutModal
                show={modalShow}
                handleClose={() => setModalShow(false)}
                cartItems={cartItems}
                userId={userId}
            />
        </div>
    );
};

export default Cart;
