import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
    const [users, setUsers] = useState([]);
    const navigate = useNavigate(); // Define navigate here

    useEffect(() => {
        console.log('LoginPage component mounted');
    }, []);
    
    useEffect(() => {
        axios.get('http://localhost:5000/api/users')
            .then(response => {
                setUsers(response.data);
            })
            .catch(error => {
                console.error('Error fetching user data:', error);
            });
    }, []);

    const handleUserClick = (user) => {
        if (user.user_id === 1) {
            navigate('/sellerDashboard', { state: { userId: user.user_id } });
        } else {
            navigate('/dashboard', { state: { userId: user.user_id } });
        }
    };

    return (
        <div>
            <h1 style={{ textAlign: 'center', marginTop: '50px' }}>Select a User Profile</h1>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '150px' }}>
                {users.map(user => (
                    <div
                        key={user.user_id}
                        className="user-profile"
                        onClick={() => handleUserClick(user)}
                        style={{ margin: '10px', cursor: 'pointer', backgroundColor: 'lightblue' }}
                    >
                        {/* <img src={`/${user.user_name}.png`} alt={user.user_name} className="profile-img" /> */}
                        <p>{user.user_name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LoginPage;
