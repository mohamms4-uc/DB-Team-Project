import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';
import SellerItemList from './SellerItemList';
import Cart from './Cart';
import AddAddressModal from './AddAddressModal';
import AddCreditCardModal from './AddCreditCardModal'; // Import the new modal
import Warehouses from './Warehouses';

const SellerDashboard = () => {
    const location = useLocation();
    const { userId } = location.state || { userId: null };
    const [userData, setUserData] = useState(null);
    const [creditCards, setCreditCards] = useState([]);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [isCreditCardModalOpen, setIsCreditCardModalOpen] = useState(false);

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

            // Fetch credit card information
            axios.get(`http://localhost:5000/api/creditcards/${userId}`)
                .then(response => {
                    console.log('Credit card data fetched:', response.data);
                    setCreditCards(response.data);
                })
                .catch(error => {
                    console.error('Error fetching credit card data:', error);
                });
        }
    }, [userId]);

    const handleAddAddress = () => {
        console.log('Add Address button clicked');
        setIsAddressModalOpen(true);
    };

    const handleAddCreditCard = () => {
        console.log('Add Credit Card button clicked');
        setIsCreditCardModalOpen(true);
    };

    const handleCloseAddressModal = () => {
        console.log('Address Modal closed');
        setIsAddressModalOpen(false);
    };

    const handleCloseCreditCardModal = () => {
        console.log('Credit Card Modal closed');
        setIsCreditCardModalOpen(false);
    };

    const handleAddressAdded = (newAddress) => {
        console.log('New address added:', newAddress);
        setUserData(prevData => ({
            ...prevData,
            addresses: [...(prevData.addresses || []), newAddress]
        }));
        setIsAddressModalOpen(false);
    };

    const handleCreditCardAdded = (newCard) => {
        console.log('New card added:', newCard);
        setCreditCards(prevCards => [...prevCards, newCard]); // Append new card to the list
        setIsCreditCardModalOpen(false);
    };

    const handleDeleteAddress = async (addressId) => {
        try {
            await axios.delete(`http://localhost:5000/api/address/${addressId}`);
            setUserData(prevData => ({
                ...prevData,
                addresses: prevData.addresses.filter(address => address.address_id !== addressId)
            }));
        } catch (error) {
            console.error('Error deleting address:', error);
        }
    };

    if (!userData) {
        return <p>Loading user data...</p>;
    }

    return (
        <div className="dashboard-container">
            <Warehouses />
            <SellerItemList />
            <div className="profile-card">
                <div className="inner-card">
                    <div className="header-container">
                        <h2>Address Information</h2>
                        <button className="add-button" onClick={handleAddAddress}>+</button>
                    </div>
                    <div className="address-info">
                        <p>{userData.street} {userData.city}, {userData.state} {userData.postal_code} {userData.country}</p>
                        {userData.addresses.map((address) => (
                            <div key={address.address_id} className="address-item">
                                <p>
                                    {address.street}, {address.city}, {address.state} {address.postal_code} {address.country}
                                </p>
                                <button 
                                    className="delete-button" 
                                    onClick={() => handleDeleteAddress(address.address_id)}
                                >
                                    -
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="inner-card">
                    <h2>Credit Card Information</h2>
                    <p><strong> Card Number: </strong>{userData.card_number}</p>
                    <div className="credit-card-info">
                        {creditCards.map((card) => (
                            <p key={card.credit_id}>
                                <strong>Card Number:</strong> {card.card_number} 
                            </p>
                        ))}
                    </div>
                    <button className="add-button" onClick={handleAddCreditCard}>+</button>
                </div>
            </div>
            {isAddressModalOpen && (
                <AddAddressModal 
                    show={isAddressModalOpen}
                    onClose={handleCloseAddressModal} 
                    userId={userId}
                    onAddressAdded={handleAddressAdded}
                />
            )}
            {isCreditCardModalOpen && (
                <AddCreditCardModal 
                    show={isCreditCardModalOpen}
                    onClose={handleCloseCreditCardModal} 
                    onCreditCardAdded={handleCreditCardAdded}
                    userId={userId}
                />
            )}
        </div>
    );
};

export default SellerDashboard;
