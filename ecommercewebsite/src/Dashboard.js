import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';
import ItemList from './ItemList';
import Cart from './Cart';
import AddAddressModal from './AddAddressModal';

const Dashboard = () => {
    const location = useLocation();
    const { userId } = location.state || { userId: null };
    const [userData, setUserData] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        if (userId) {
            console.log('Fetching user data for userId:', userId);
            axios.get(`http://localhost:5000/api/user/${userId}`)
                .then(response => {
                    console.log('User data fetched:', response.data);
                    setUserData(response.data);
                })
                .catch(error => {
                    console.error('Error fetching user data:', error);
                });
        }
    }, [userId]);

    const handleAddAddress = () => {
        console.log('Add Address button clicked');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        console.log('Modal closed');
        setIsModalOpen(false);
    };

    const handleAddressAdded = (newAddress) => {
        console.log('New address added:', newAddress);
        setUserData(prevData => ({
            ...prevData,
            addresses: [...(prevData.addresses || []), newAddress]
        }));
        setIsModalOpen(false);
    };

    if (!userData) {
        return <p>Loading user data...</p>;
    }

    return (
        <div className="dashboard-container">
            <Cart />
            <ItemList />
            <div className="profile-card">
                <div className="inner-card">
                    <h2>Address Information</h2>
                    <div className="address-section">
                        <button className="add-button" onClick={handleAddAddress}>Add</button>
                        <button className="add-button">Delete</button>
                        <button className="add-button">Edit</button>
                    </div>
                    <div className="address-info">
                        {userData.addresses && userData.addresses.length > 0 ? (
                            userData.addresses.map((address, index) => (
                                <p key={index}>
                                    {address.street}, {address.city}, {address.state} {address.postal_code} {address.country}
                                </p>
                            ))
                        ) : (
                            <p>No addresses available.</p>
                        )}
                    </div>
                </div>
                <div className="inner-card">
                    <h2>Credit Card Information</h2>
                    <div className="address-section">
                        <button className="add-button">Add</button>
                        <button className="add-button">Delete</button>
                        <button className="add-button">Edit</button>
                    </div>
                    <p><strong>Card Number:</strong> {userData.card_number}</p>
                    <p><strong>PIN:</strong> {userData.pin}</p>
                    <p><strong>Expiration Date:</strong> {userData.expiration_date}</p>
                </div>
            </div>
            {isModalOpen && (
                <AddAddressModal 
                    show={isModalOpen}
                    onClose={handleCloseModal} 
                    userId={userId}
                    onAddressAdded={handleAddressAdded}
                />
            )}
        </div>
    );
};

export default Dashboard;