import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.css';
import { UserProvider } from './components/UserContext';

// Create a root.
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the App component within the UserProvider context.
root.render(
  <UserProvider>
    <App />
  </UserProvider>,
  document.getElementById('root')
);

reportWebVitals();
