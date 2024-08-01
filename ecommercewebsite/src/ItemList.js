import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ItemList.css';

const ItemList = () => {
    const [items, setItems] = useState([]);
    const [search, setSearch] = useState('');
    const [userId, setUserId] = useState(1); // Replace with actual user ID retrieval logic

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/products');
                setItems(response.data);
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        fetchProducts();
    }, []);

    const handleAddToCart = async (productId) => {
        try {
            await axios.post('http://localhost:5000/api/cart', {
                userId,
                productId,
                quantity: 1, // Default quantity
            });
            console.log(`Added product ${productId} to cart`);
        } catch (error) {
            console.error('Error adding item to cart:', error);
        }
    };

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const filteredItems = items.filter(item => 
        item.category.toLowerCase().includes(search.toLowerCase()) ||
        item.brand.toLowerCase().includes(search.toLowerCase()) ||
        item.item_name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="item-list-container">
            <h2>Item List</h2>
            <div className="search-bar">
                <input
                    type="text"
                    value={search}
                    onChange={handleSearchChange}
                    placeholder="Search by category, brand, or item name"
                />
            </div>
            <table className="item-list-table">
                <thead>
                    <tr>
                        <th>Category</th>
                        <th>Brand</th>
                        <th>Item Name</th>
                        <th>Standard Price</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredItems.map(item => (
                        <tr key={item.product_id}>
                            <td>{item.category}</td>
                            <td>{item.brand}</td>
                            <td>{item.item_name}</td>
                            <td>${item.standard_price.toFixed(2)}</td>
                            <td>
                                <button onClick={() => handleAddToCart(item.product_id)}>Add to Cart</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ItemList;
