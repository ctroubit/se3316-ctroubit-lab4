import React, { createContext, useState, useContext } from 'react';

export const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [selectedList, setSelectedList] = useState('');

  return (
    <UserContext.Provider value={{ user, setUser, selectedList, setSelectedList }}>
      {children}
    </UserContext.Provider>
  );
};