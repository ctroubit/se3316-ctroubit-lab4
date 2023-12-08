import React, { useState, useEffect ,useContext} from 'react';
import './ListDisplay.css'
import { UserContext } from './UserContext'; 
import SuperheroSearch from './SuperheroSearch';


function ListDisplay({ listName }) {
  const [lists, setLists] = useState([]);
  const [listElements, setListElements] = useState([]);
  const [error, setError] = useState('');
  const [newListName, setNewListName] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const { user, selectedList, setSelectedList } = useContext(UserContext);

  useEffect(() => {
    const fetchLists = async () => {
      if (!user) return; 
      try {
        const response = await fetch(`http://localhost:3000/api/lists/${user.username}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setLists(data);
      } catch (error) {
        console.error('Error fetching lists:', error);
        setError(error.message);
      }
    };
    fetchLists();
  }, [user]); 

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return; 
  
    try {
      const response = await fetch('http://localhost:3000/api/lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: user.username, 
          listName: newListName,
          superheroes: [] 
        }),
      });
  
      if (response.ok) {
        const newList = { listName: newListName, superheroes: [] };
        setLists([...lists, newList]);
        setNewListName('');
      } else {
        console.error('Failed to create the list');
        
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
      const selectedList = lists.find(list => list.listName === listName);
      if (selectedList) {
          setListElements(selectedList.superheroes);
      }
  }, [listName, lists]);

  const handleListClick = (name) => {
    const selectedList = lists.find(list => list.listName === name);
    if (selectedList) {
      setListElements(selectedList.superheroes);
      setSelectedList(name); 
    }
};
  if (!user) {
    return <div>Please log in to view your lists.</div>;
  }

  if (error) {
      return <div>Error: {error}</div>;
  }

  const handleDeleteList = async () => {
    const listDelete = window.prompt('Enter the name of the list to be deleted:')
    try {
      
      const response = await fetch(`http://localhost:3000/api/lists/${user.username}/${listDelete}`, {
        method: 'DELETE',
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
     
      const updatedLists = lists.filter(list => list.listName !== listDelete);
      setLists(updatedLists);
  
     
      if (selectedList === listDelete) {
        setSelectedList('');
        setListElements([]);
      }
    } catch (error) {
      console.error('Error deleting list:', error);
    }
  };

  

  return (
    <div>
      <div id='listContainer'>
        <h1>Lists</h1>
        {lists.map((listItem, index) => (
          <button 
            key={index} 
            onClick={() => handleListClick(listItem.listName)}
            className={`listButton ${listItem.listName === listName ? 'selected' : ''}`}
          >
            {listItem.listName}
          </button>
        ))}
        <form onSubmit={handleCreateList}>
          <input 
            type="text" 
            value={newListName} 
            onChange={(e) => setNewListName(e.target.value)} 
            placeholder="New list name" 
          />
          <button type="submit">Create List</button>
        </form>
        <button 
      onClick={() => handleDeleteList()}
      className="deleteListButton"
    >
      Delete
    </button>
      </div>
      <div id='superheroesContainer'>
      <h2>{selectedList || 'Select a List'}</h2>
      {listElements.length > 0 ? (
        listElements.map((element, index) => (
          <div key={index} className="superheroItem">
            <p>{element.name}</p>
          </div>
        ))
      ) : (
        <p>No superheroes in this list.</p>
      )}
    </div>
      {searchResults && <SuperheroSearch superheroes={searchResults} />}
    </div>
  );

}

export default ListDisplay;