import React from 'react';
import ReactDOM from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.css';
import { UserProvider } from './components/UserContext';

// Create a root.
const container = document.getElementById('root')
const root = createRoot(container); 

// Render the App component within the UserProvider context.
root.render(
  <UserProvider>
    <App />
  </UserProvider>
);

reportWebVitals();
