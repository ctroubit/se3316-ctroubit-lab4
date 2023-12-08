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
  const [selectedList, setSelectedList] = useState('');
  const [userInfo, setUserInfo] = useState(null);

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
  const handleListSelection = (listName) => {
    setSelectedList(listName);
  };

  const handleFetchList = async () => {
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      setUserInfo(data); 
      console.log(data)
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  return (
    <div className="app-container">
      <div className="navbar">
      <SearchBox onSearch={handleSearch} onFetchList={handleFetchList} />
      </div>
      <div className="sidebar">
        {user && <ListDisplay  listName={selectedList} onListSelect={handleListSelection}/>}
      </div>
      <div className="main">
  {userInfo ? (
    <div>
      {userInfo.map((user, index) => (
        <div key={index} className="user-info">
        <p>Username: {user.username}</p>
        <p>Email: {user.email}</p>
        <p>Activated: {user.isActivated ? 'Yes' : 'No'}</p>
        <p>Admin: {user.isAdmin ? 'Yes' : 'No'}</p>
      </div>
      ))}
    </div>
  ) : (
    <>
      <SuperheroSearch  />
      {showLogin && <Login onLoginSuccess={handleLoginSuccess} />}
    </>
  )}
</div>
      <Footer />
    </div>
  );
}

export default App;
