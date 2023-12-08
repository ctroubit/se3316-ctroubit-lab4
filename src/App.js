import React, { useContext, useState } from 'react';
import Login from './components/login';
import ListDisplay from './components/ListDisplay';
import SearchBox from './components/SearchBox';
import SuperheroSearch from './components/SuperheroSearch';
import { UserContext } from './components/UserContext';
import './App.css';
import Footer from './components/Footer';

function App() {
  const { user, setUser } = useContext(UserContext);
  const [showLogin, setShowLogin] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setShowLogin(false);
  };

  const handleLoginClick = () => {
    setShowLogin(true);
  };

  const handleSearch = (params) => {
    setSearchResults(params);
  };

  return (
    <div className="app-container">
      <div className="navbar">
        <SearchBox onSearch={handleSearch} />
      </div>
      <div className="sidebar">
        {user && <ListDisplay listName="Your List Name" />}
      </div>
      <div className="main">
        <SuperheroSearch searchParams={searchResults} />
        {showLogin && <Login onLoginSuccess={handleLoginSuccess} />}
      </div>
      <Footer />
    </div>
  );
}

export default App;
