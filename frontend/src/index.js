import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App';
import './styles/globals.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'linear-gradient(135deg, #87CEEB, #4682B4)',
            color: 'white',
            fontWeight: '600',
            borderRadius: '12px',
            boxShadow: '0 8px 25px rgba(70, 130, 180, 0.3)',
          },
          success: {
            iconTheme: {
              primary: 'white',
              secondary: '#4CAF50',
            },
          },
          error: {
            iconTheme: {
              primary: 'white',
              secondary: '#f44336',
            },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);