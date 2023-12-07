import React, { useContext, useState } from 'react';
import Login from './components/login';
import ListDisplay from './components/ListDisplay';
import { UserContext } from './components/UserContext'; 
import SearchBox from './components/SearchBox';
import './App.css';
import Footer from './components/Footer'

function App() {
  const { user, setUser } = useContext(UserContext);
  const [isBlurred, setIsBlurred] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsBlurred(false); // Clear blur on login success
    setShowLogin(false);
  };

  const handleLoginClick = () => {
    setShowLogin(true);
  };

  return (
    <div className={isBlurred ? 'blur-effect' : ''}>
      {showLogin && (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
      <div className="content-container">
        <SearchBox setIsBlurred={setIsBlurred} onLoginClick={handleLoginClick} />
        {user && (
          <ListDisplay listName="Your List Name" />
        )}
      </div>
      <Footer />
    </div>
  )
}

export default App;
