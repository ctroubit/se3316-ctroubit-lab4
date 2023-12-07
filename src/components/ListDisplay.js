import React, { useState, useEffect ,useContext} from 'react';
import './ListDisplay.css'
import { UserContext } from './UserContext'; 


function ListDisplay({ listName }) {
  const [lists, setLists] = useState([]);
  const [listElements, setListElements] = useState([]);
  const [selectedList, setSelectedList] = useState('');
  const [error, setError] = useState('');
  const [newListName, setNewListName] = useState('');
  const { user } = useContext(UserContext);

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
    try {
      const response = await fetch('http://localhost:3000/api/lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'username', 
          listName: newListName,
          superheroes: [] 
        }),
      });

      if (response.ok) {
        setLists([...lists, { listName: newListName, superheroes: [] }]);
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
      setSelectedList(listName);
      
      listName = name;
    }
  };

  if (!user) {
    return <div>Please log in to view your lists.</div>;
  }

  if (error) {
      return <div>Error: {error}</div>;
  }

  if (lists.length === 0) {
      return <div>Loading lists or no lists available...</div>;
  }

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
      </div>
      <div id='superheroesContainer'>
        <h2>{selectedList && `${selectedList}`}</h2>
        {listElements.map((element, index) => (
          <div key={index} className="superheroItem">
            <p>{element.name}</p>
          </div>
        ))}
      </div>
    </div>
  );

}

export default ListDisplay;