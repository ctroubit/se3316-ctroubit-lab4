import React, { useContext, useState } from 'react';
import Login from './components/login';
import ListDisplay from './components/ListDisplay';
import SuperheroSearch from './components/SuperheroSearch'; // Import the SuperheroSearch component
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
    setIsBlurred(false);
    setShowLogin(false);
  };

  const handleLoginClick = () => {
    setShowLogin(true);
  };

  return (
    <div className={isBlurred ? 'blur-effect' : ''}>
      <SearchBox setIsBlurred={setIsBlurred} onLoginClick={handleLoginClick} />
      
      {showLogin && (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
      {user && (
        <>
          <ListDisplay listName="Your List Name" />
          
        </>
      )}
      <Footer></Footer>
    </div>
  );
}

export default App;
