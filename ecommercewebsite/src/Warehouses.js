// src/components/Warehouses.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Cart.css'; // Optional: Add custom styling

const Warehouses = () => {
    const [warehouses, setWarehouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch warehouse data from API
        axios.get('http://localhost:3000/warehouses')
            .then(response => {
                setWarehouses(response.data);
                setLoading(false);
            })
            .catch(error => {
                setError('Error fetching warehouse data');
                setLoading(false);
            });
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className="warehouses-container">
            <h2>Warehouses</h2>
            <table className="warehouses-table">
                <thead>
                    <tr>
                        <th>Warehouse ID</th>
                        <th>Warehouse Name</th>
                        <th>Address ID</th>
                        <th>Capacity</th>
                    </tr>
                </thead>
                <tbody>
                    {warehouses.map(warehouse => (
                        <tr key={warehouse.warehouse_id}>
                            <td>{warehouse.warehouse_id}</td>
                            <td>{warehouse.warehouse_name}</td>
                            <td>{warehouse.w_address_id}</td>
                            <td>{warehouse.capacity}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Warehouses;
