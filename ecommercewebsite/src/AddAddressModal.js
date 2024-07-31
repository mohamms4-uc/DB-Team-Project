import React, { useState } from 'react';
import axios from 'axios';
import { Modal, Button, Form } from 'react-bootstrap';

const AddAddressModal = ({ show, onClose, userId, onAddressAdded }) => {
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('');

    const handleSubmit = async (event) => {
        event.preventDefault();
        const addressData = {
            street,
            city,
            state,
            postal_code: postalCode,
            country,
            user_id: userId,
            address_id: userId,  // Update this if necessary
            address_type: 'home',
        };
        try {
            const response = await axios.post('http://localhost:5000/api/address', addressData);
            console.log('Address added:', response.data);
            onAddressAdded(response.data);
        } catch (error) {
            console.error('Error adding address:', error);
        }
    };

    return (
        <Modal show={show} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Add Address</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="formStreet">
                        <Form.Label>Street</Form.Label>
                        <Form.Control 
                            type="text" 
                            value={street} 
                            onChange={(e) => setStreet(e.target.value)} 
                            required 
                        />
                    </Form.Group>
                    <Form.Group controlId="formCity">
                        <Form.Label>City</Form.Label>
                        <Form.Control 
                            type="text" 
                            value={city} 
                            onChange={(e) => setCity(e.target.value)} 
                            required 
                        />
                    </Form.Group>
                    <Form.Group controlId="formState">
                        <Form.Label>State</Form.Label>
                        <Form.Control 
                            type="text" 
                            value={state} 
                            onChange={(e) => setState(e.target.value)} 
                            required 
                        />
                    </Form.Group>
                    <Form.Group controlId="formPostalCode">
                        <Form.Label>Postal Code</Form.Label>
                        <Form.Control 
                            type="text" 
                            value={postalCode} 
                            onChange={(e) => setPostalCode(e.target.value)} 
                            required 
                        />
                    </Form.Group>
                    <Form.Group controlId="formCountry">
                        <Form.Label>Country</Form.Label>
                        <Form.Control 
                            type="text" 
                            value={country} 
                            onChange={(e) => setCountry(e.target.value)} 
                            required 
                        />
                    </Form.Group>
                    <Button variant="primary" type="submit">
                        Add Address
                    </Button>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default AddAddressModal;
