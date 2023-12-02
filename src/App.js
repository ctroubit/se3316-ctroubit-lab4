import React, { useState } from 'react';
import SearchBox from './components/SearchBox.js';
import Login from "./components/login.js";
import './App.css'; 

function App() {
  const [isBlurred, setIsBlurred] = useState(false);
  

  const handleClose = () => {
    setIsBlurred(false);
  };
  return (
    <div className={isBlurred ? 'blur-effect' : ''}>
      <SearchBox setIsBlurred={setIsBlurred} />
      
    </div>
  );
}


export default App;
