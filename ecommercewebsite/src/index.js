import React from 'react';
import ReactDOM from 'react-dom/client'; // Import createRoot instead of ReactDOM.render
import App from './App'; // Assuming your main App component is in App.js
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';


const root = ReactDOM.createRoot(document.getElementById('root')); // Create a root container
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
