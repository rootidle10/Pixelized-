import React from 'react';
import ReactDOM from 'react-dom/client';
/* 👇 AJOUTE CETTE LIGNE IMPORTANTE 👇 */
import './index.css'; 
/* 👆 C'est elle qui charge tes couleurs et tes resets */
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);