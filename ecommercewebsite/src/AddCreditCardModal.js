import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import axios from 'axios';

const AddCreditCardModal = ({ show, onClose, onCreditCardAdded, userId }) => {
    const [cardNumber, setCardNumber] = useState('');
    const [pin, setPin] = useState('');
    const [expirationDate, setExpirationDate] = useState('');
    const [addressId, setAddressId] = useState('');

    const handleSubmit = async () => {
        try {
            const newCard = {
                userId,
                card_number: cardNumber,
                pin,
                expiration_date: expirationDate,
                address_id: addressId,
                c_user_id: userId,
            };

            const response = await axios.post('http://localhost:5000/api/creditcard', newCard);
            onCreditCardAdded(response.data);
        } catch (error) {
            console.error('Error adding credit card:', error);
        }
    };

    return (
        <Modal show={show} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Add Credit Card</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group controlId="formCardNumber">
                        <Form.Label>Card Number</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Enter card number"
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group controlId="formExpirationDate">
                        <Form.Label>Expiration Date</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="MM/YY"
                            value={expirationDate}
                            onChange={(e) => setExpirationDate(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group controlId="formPIN">
                        <Form.Label>PIN</Form.Label>
                        <Form.Control 
                            type="password" 
                            placeholder="Enter PIN"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group controlId="formAddressId">
                        <Form.Label>Address ID</Form.Label>
                        <Form.Control 
                            type="text" 
                            placeholder="Enter address ID"
                            value={addressId}
                            onChange={(e) => setAddressId(e.target.value)}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    Save
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AddCreditCardModal;
