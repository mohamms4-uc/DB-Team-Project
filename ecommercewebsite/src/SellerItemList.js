import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ModifyItemModal from './ModifyItemModal';
import './ItemList.css'; // Ensure this path is correct

const SellerItemList = ({ onDelete, onAddStock }) => {
    const [selectedItem, setSelectedItem] = useState(null);
    const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);
    const [items, setItems] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/products');
                setItems(response.data); // Set fetched items
            } catch (error) {
                console.error('Error fetching products:', error);
            }
        };

        fetchProducts();
    }, []);

    const handleModifyItemClick = (item) => {
        setSelectedItem(item);
        setIsModifyModalOpen(true);
    };

    const handleCloseModifyModal = () => {
        setIsModifyModalOpen(false);
    };

    const handleItemModified = (updatedItem) => {
        setItems(items.map(item => item.product_id === updatedItem.product_id ? updatedItem : item));
    };

    return (
        <div className="item-list-container">
            <h2>Item List</h2>
            <div className="search-bar">
                <input type="text" placeholder="Search items..." />
            </div>
            <table className="item-list-table">
                <thead>
                    <tr>
                        <th>Item Name</th>
                        <th>Category</th>
                        <th>Brand</th>
                        <th>Size</th>
                        <th>Description</th>
                        <th>Warehouse ID</th>
                        <th>Price</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {items.length > 0 ? (
                        items.map(item => (
                            <tr key={item.product_id}>
                                <td>{item.item_name}</td>
                                <td>{item.category}</td>
                                <td>{item.brand}</td>
                                <td>{item.item_size}</td>
                                <td>{item.description}</td>
                                <td>{item.p_warehouse_id}</td>
                                <td>${item.standard_price}</td>
                                <td>
                                    <button onClick={() => handleModifyItemClick(item)}>Modify Item</button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8">No items available.</td>
                        </tr>
                    )}
                </tbody>
            </table>
          
            {isModifyModalOpen && (
                <ModifyItemModal 
                    show={isModifyModalOpen}
                    onClose={handleCloseModifyModal} 
                    item={selectedItem}
                    onItemModified={handleItemModified} 
                />
            )}
        </div>
    );
};

export default SellerItemList;
