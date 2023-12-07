import React, { useState, useEffect } from 'react';
import './SuperheroSearch.css'

function SuperheroSearch({superheroes}) {
    
    const [selectedList, setSelectedList] = useState(''); 


    function createSuperheroesDiv(fetchedSuperheroes) {
        return (
            <div id = 'superheroesDiv'style={{ background: '#3500D3', /* Other styles */ }}>
                <ul style={{ /* Styles for ul */ }}>
                    {fetchedSuperheroes.map(hero => createSuperheroListItem(hero))}
                </ul>
            </div>
        );
    }
    function addToMyList(){
        
    }
    
    function createSuperheroListItem(hero) {
        return (
          <li key={hero._id} style={{ /* Styles for li */ }}>
            <h3>{hero.name}</h3>
            <div>{`Alignment: ${hero.Alignment}`}</div>
            <div>{`Eye Color: ${hero["Eye color"]}`}</div>
            <div>{`Gender: ${hero.Gender}`}</div>
            <div>{`Hair Color: ${hero["Hair color"]}`}</div>
            <div>{`Height: ${hero.Height}`}</div>
            <div>{`Publisher: ${hero.Publisher}`}</div>
            <div>{`Race: ${hero.Race}`}</div>
            <div>{`Skin Color: ${hero["Skin color"]}`}</div>
            <div>{`Weight: ${hero.Weight}`}</div>
            <button onClick={() => addToMyList(hero, selectedList)}>Add to List</button>
            <button onClick={() => searchSuperheroOnDuckDuckGo(hero.name)}>
        Search on DuckDuckGo
      </button>
          </li>
        );
      }
      function searchSuperheroOnDuckDuckGo(heroName) {
        const searchUrl = `https://duckduckgo.com/?q=${encodeURIComponent(heroName)}+superhero`;
        window.open(searchUrl, '_blank');
      }

   
    return (
        <div>
            {/* Render superheroes */}
            {createSuperheroesDiv(superheroes)}
        </div>
    );
}

export default SuperheroSearch;