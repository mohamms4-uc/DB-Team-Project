import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CheckoutModal.css';
import { Modal, Button, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'; // Ensure Bootstrap CSS is imported

const CheckoutModal = ({ show, handleClose, cartItems, userId }) => {
    const [addresses, setAddresses] = useState([]);
    const [creditCards, setCreditCards] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState('');
    const [selectedCreditCard, setSelectedCreditCard] = useState('');
    const [deliveryPlan, setDeliveryPlan] = useState('');

    useEffect(() => {
        if (userId) {
            const fetchUserDetails = async () => {
                try {
                    const response = await axios.get(`http://localhost:5000/api/user/${userId}`);
                    setAddresses(response.data.addresses || []);
                    const creditCardResponse = await axios.get(`http://localhost:5000/api/creditcards/${userId}`);
                    setCreditCards(creditCardResponse.data || []);
                } catch (error) {
                    console.error('Error fetching user details:', error);
                }
            };

            fetchUserDetails();
        }
    }, [userId]);

    const handleCompleteOrder = async () => {
        try {
            await axios.post('http://localhost:5000/api/order', {
                userId,
                creditCardId: selectedCreditCard,
                deliveryType: deliveryPlan,
                deliveryPrice: 10, // Example delivery price
                deliverDate: new Date().toISOString().split('T')[0] // Example deliver date
            });

            alert('Order completed successfully!');
            handleClose();
        } catch (error) {
            console.error('Error completing order:', error);
            alert('Error completing order');
        }
    };

    return (
        <Modal
            show={show}
            onHide={handleClose}
            size="lg"
            dialogClassName="checkout-modal" // Add custom class for styling
        >
            <Modal.Header closeButton>
                <div className="checkout-modal-header">
                    <h2>Checkout</h2>
                    <Button className="close-button" onClick={handleClose}>Close</Button>
                </div>
            </Modal.Header>
            <Modal.Body>
                <h5>Your Cart Items</h5>
                <table className="checkout-table">
                    <thead>
                        <tr>
                            <th>Item Name</th>
                            <th>Category</th>
                            <th>Brand</th>
                            <th>Size</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Total</th>
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
                            </tr>
                        ))}
                    </tbody>
                </table>

                <Form>
                    <Form.Group controlId="formAddress">
                        <Form.Label>Select Address</Form.Label>
                        <Form.Control
                            as="select"
                            value={selectedAddress}
                            onChange={e => setSelectedAddress(e.target.value)}
                        >
                            <option value="">Select Address</option>
                            {addresses.map(address => (
                                <option key={address.address_id} value={address.address_id}>
                                    {address.street}, {address.city}, {address.state} {address.postal_code}, {address.country}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>

                    <Form.Group controlId="formCreditCard">
                        <Form.Label>Select Credit Card</Form.Label>
                        <Form.Control
                            as="select"
                            value={selectedCreditCard}
                            onChange={e => setSelectedCreditCard(e.target.value)}
                        >
                            <option value="">Select Credit Card</option>
                            {creditCards.map(card => (
                                <option key={card.credit_id} value={card.credit_id}>
                                    **** **** **** {card.card_number.slice(-4)}
                                </option>
                            ))}
                        </Form.Control>
                    </Form.Group>

                    <Form.Group controlId="formDeliveryPlan">
                        <Form.Label>Delivery Plan</Form.Label>
                        <Form.Control
                            as="select"
                            value={deliveryPlan}
                            onChange={e => setDeliveryPlan(e.target.value)}
                        >
                            <option value="">Select Delivery Plan</option>
                            <option value="Standard">Standard - $10</option>
                            <option value="Express">Express - $20</option>
                        </Form.Control>
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button className="cancel-button" onClick={handleClose}>
                    Cancel
                </Button>
                <Button className="complete-order-button" onClick={handleCompleteOrder}>
                    Complete Order
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CheckoutModal;
