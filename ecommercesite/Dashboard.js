import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';
import ItemList from './ItemList'; // Import the new component
import Cart from './Cart';

const Dashboard = () => {
    const location = useLocation();
    const { userId } = location.state || { userId: null };
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        if (userId) {
            axios.get(`http://localhost:5000/api/user/${userId}`)
                .then(response => {
                    setUserData(response.data);
                })
                .catch(error => {
                    console.error('Error fetching user data:', error);
                });
        }
    }, [userId]);

    if (!userData) {
        return <p>Loading...</p>;
    }

    return (
        <div className="dashboard-container">
            <Cart />
            <ItemList />
            <div className="profile-card">
                <div className="inner-card">
                    <h2>Address Information</h2>
                    <p>{userData.street} {userData.city}, {userData.state} {userData.postal_code} {userData.country}</p>
                </div>
                <div className="inner-card">
                    <h2>Credit Card Information</h2>
                    <p><strong>Card Number:</strong> {userData.card_number}</p>
                    <p><strong>PIN:</strong> {userData.pin}</p>
                    <p><strong>Expiration Date:</strong> {userData.expiration_date}</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
