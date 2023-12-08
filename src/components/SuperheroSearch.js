import React, { useState, useEffect } from 'react';
import './SuperheroSearch.css'

function SuperheroSearch({searchParams}) {
    
    const [selectedList, setSelectedList] = useState(''); 
    const [superheroes, setSuperheroes] = useState([]);
    const [hasResults, setHasResults] = useState(true);

    useEffect(() => {
        const fetchSuperheroes = async () => {
            console.log("Search Params:", searchParams);
    
            // Constructing the query parameters string
            const queryParams = new URLSearchParams();
            if (searchParams.name) queryParams.append('name', searchParams.name);
            if (searchParams.race) queryParams.append('Race', searchParams.race);
            if (searchParams.publisher) queryParams.append('Publisher', searchParams.publisher);
            if (searchParams.power) queryParams.append('power', searchParams.power);
            // Add limit if needed: queryParams.append('limit', 'YOUR_LIMIT');
    
            let url = `http://localhost:3000/api/superheroes?${queryParams.toString()}`;
    
            try {
                const response = await fetch(url);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                console.log(data)
                setHasResults(data.length > 0);
                setSuperheroes(data);
            } catch (error) {
                console.error("Search Error:", error);
                setHasResults(false);
                alert('No Superheroes Found!')
            }
        };
    
        if (searchParams && Object.keys(searchParams).length > 0) {
            fetchSuperheroes();
        }
    }, [searchParams]);


    function createSuperheroesDiv(fetchedSuperheroes) {
        return (
            <div id = 'superheroesDiv'>
                <ul>
                    {fetchedSuperheroes.map(hero => createSuperheroListItem(hero))}
                </ul>
            </div>
        );
    }

    function addToMyList(){
        
    }
    
    function createSuperheroListItem(hero) {
        return (
          <li key={hero._id} >
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
        <div id='superheroesDiv'>
            {hasResults ? (
                <ul className='superheroList'>
                    {superheroes.map(hero => createSuperheroListItem(hero))}
                </ul>
            ) : (
                <div>No Superheroes Found</div>
            )}
        </div>
    );
}

export default SuperheroSearch;