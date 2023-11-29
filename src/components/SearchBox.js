import React, { useState, useEffect } from "react";
import './SearchBox.css'

function SearchBox() {
  const [publishers, setPublishers] = useState([]);
  const [races, setRaces] = useState([])
  const [powers, setPowers] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/api/superheroes/info')
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new TypeError("Oops, we haven't got JSON!");
    }
    return response.json();
  })
  .then(data => {
        console.log(data)
        const uniquePublishers = new Set();
        const uniqueRaces = new Set();
        for (const superhero of data) {
          if (superhero.Publisher) {
            uniquePublishers.add(superhero.Publisher);
            console.log(superhero.publisher);
          }
          if(superhero.Race){
            uniqueRaces.add(superhero.Race)
          }
        }
        setRaces([...uniqueRaces])
        setPublishers([...uniquePublishers]);
      })
      .catch((error) => console.error("Error: ", error));
  }, []);

  useEffect(() => {
    getPowers();
  }, []);

  function getPowers() {
    fetch(`http://localhost:3000/api/superheroes/powers`)
      .then(response => {
        if (!response.ok)
            throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then(data => {
          const allPowers = new Set();

          Object.keys(data).forEach(key => {
              if (key !== 'hero_names' && key !== '_id') {
                  allPowers.add(key);
              }
          });

          setPowers([...allPowers]); // Set powers state
      })
      .catch(error => console.error('Error', error));
  }
  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">
          Superhero Search
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a className="nav-link active" aria-current="page" href="#">
                Name
              </a>
            </li>
            <li>
              <form className="d-flex" role="search">
                <input
                  className="form-control me-2"
                  type="search"
                  placeholder="Search"
                  aria-label="Search"
                ></input>
              </form>
            </li>
            <a className="nav-link active" aria-current="page" href="#">
                Race
              </a>
            <li className="race-item">
            <select id="raceSelection" className="form-select">
                  {races.map((races, index) => (
                      <option key={index} value={races}>
                          {races}
                      </option>
                  ))}
              </select>
            </li>
            <a className="nav-link active" aria-current="page" href="#">
                Publisher
              </a>
            <select id="publisherSelection" className="form-select ">
                  {publishers.map((publisher, index) => (
                      <option key={index} value={publisher}>
                          {publisher}
                      </option>
                  ))}
              </select>
              <a className="nav-link active" aria-current="page" href="#">
                Powers
              </a>
              <select id="powerSelection" className="form-select">
                {powers.map((power, index) => (
                  <option key={index} value={power}>
                    {power}
                  </option>
                ))}
              </select>      
          </ul>
          <button className="btn btn-outline-success" id = 'searchButton'>
              Search
            </button>

          <form className="d-flex" role="search">
            
            <button className="btn btn-outline-success" type="submit">
              Login
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
export default SearchBox;
