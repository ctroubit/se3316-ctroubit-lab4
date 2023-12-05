import React, { useState, useEffect } from 'react';
import './ListDisplay.css'

function ListDisplay({ listName }) {
    const [lists, setLists] = useState([]);
    const [selectedList, setSelectedList] = useState('');
    const [listElements, setListElements] = useState([]);
    const [error, setError] = useState('');
  
  useEffect(() => {
    fetchLists();
  }, []);

 
  const fetchLists = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/lists');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setLists(data);
    } catch (error) {
      console.error('Error fetching lists:', error);
      setError(error.message);
    }
    }   

   
  const displayListElements = async (listName) => {
    try {
      const response = await fetch(`http://localhost:3000/api/lists/${listName}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      if (data && Array.isArray(data.superheroes)) {
        setListElements(data.superheroes);
      }
    } catch (error) {
      console.error('Error displaying list elements:', error);
      setError(error.message);
    }
  };


  const createNewList = async (userInput) => {
    try {
      const data = {
        listName: userInput,
        superheroes: []
      };
      const response = await fetch('http://localhost:3000/api/lists/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        if (response.status === 409) { 
          alert('List Name Already Exists!');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } else {
        await fetchLists(); 
      }
    } catch (error) {
      console.error('Error creating a new list:', error);
      setError(error.message);
    }
  };

 
  const selectList = (listName) => {
    setSelectedList(listName);
    displayListElements(listName);
  };


  const addToMyList = async (superhero) => {
    try {
      const response = await fetch(`http://localhost:3000/api/lists/${selectedList}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ superhero: superhero })
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      await displayListElements(selectedList); 
    } catch (error) {
      console.error('Error adding superhero to list:', error);
      setError(error.message);
    }
  };

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
                    onClick={() => {
                        selectList(listItem.listName);
                        displayListElements(listItem.listName);
                    }}
                    className={`listButton ${selectedList === listItem.listName ? 'selected' : ''}`}
                >
                    {listItem.listName}
                </button>
            ))}
        </div>

        <div id='superheroesContainer'>
            <h2>{selectedList && `${selectedList} Superheroes`}</h2>
            {selectedList && listElements.map((element, index) => (
                <div key={index} className="superheroItem">
                    {/* Display superhero details here */}
                    <p>{element.name}</p>
                    {/* You can add more superhero details here */}
                    <button onClick={() => addToMyList(element)}>Add to List</button>
                </div>
            ))}
        </div>
    </div>
);
}



export default ListDisplay;
