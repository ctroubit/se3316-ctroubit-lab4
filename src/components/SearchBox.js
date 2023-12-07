import React, { useState, useEffect ,useContext} from "react";
import './SearchBox.css'
import InfoBox from './login';
import { UserContext } from './UserContext'; 
import SuperheroSearch from './SuperheroSearch'; 

function SearchBox() {
  const [publishers, setPublishers] = useState([]);
  const [races, setRaces] = useState([]);
  const [powers, setPowers] = useState([]);
  const [isBlurred, setIsBlurred] = useState(false);
  const [showInfoBox, setShowInfoBox] = useState(false);
  const { user } = useContext(UserContext);
  const [searchName, setSearchName] = useState('');
  const [selectedPower, setSelectedPower] = useState(''); 
  const [searchResults, setSearchResults] = useState([]);
  const [selectedRace, setSelectedRace] = useState('');
  const [selectedPublisher, setSelectedPublisher] = useState('');
 


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
        const uniquePublishers = new Set();
        const uniqueRaces = new Set();
        for (const superhero of data) {
          if (superhero.Publisher) {
            uniquePublishers.add(superhero.Publisher);
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

          setPowers([...allPowers]); 
      })
      .catch(error => console.error('Error', error));
  }

  const handleSearch = async () => {
    let url = `http://localhost:3000/api/superheroes?`;
    url += searchName ? `name=${encodeURIComponent(searchName)}&` : '';
    url += selectedRace ? `Race=${encodeURIComponent(selectedRace)}&` : '';
    url += selectedPublisher ? `Publisher=${encodeURIComponent(selectedPublisher)}&` : '';
    url += selectedPower ? `power=${encodeURIComponent(selectedPower)}` : '';
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        console.log(data)
        
        setSearchResults(data); 
    } catch (error) {
        console.error('Search Error:', error);
    }
};
  return (
    <div>
    <div className={isBlurred ? "main-container blurred" : "main-container"}>
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
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}/>
              </form>
            </li>
            <a className="nav-link active" aria-current="page" href="#">
                Race
              </a>
            <li className="race-item">
            <select id="raceSelection" className="form-select"
                    onChange={(e) => setSelectedRace(e.target.value)}>
                      <option value="">Select Race</option>
                {races.map((race, index) => (
                    <option key={index} value={race}>{race}</option>
                ))}
            </select>
            </li>
            <a className="nav-link active" aria-current="page" href="#">
                Publisher
              </a>
              <select id="publisherSelection" className="form-select"
                    onChange={(e) => setSelectedPublisher(e.target.value)}>
                      <option value="">Select Publisher</option>
                {publishers.map((publisher, index) => (
                    <option key={index} value={publisher}>{publisher}</option>
                ))}
            </select>
              <a className="nav-link active" aria-current="page" href="#">
                Powers
              </a>
              <select id="powerSelection" className="form-select">
              <option value="">Select Power</option>
                {powers.map((power, index) => (
                  <option key={index} value={power}>
                    {power}
                  </option>
                ))}
              </select>      
          </ul>
          <button className="btn btn-outline-success" id='searchButton' onClick={handleSearch}>
                Search
            </button>

          <button className="btn btn-outline-success" onClick={() => {setIsBlurred(prev => !prev)
            setShowInfoBox(true);}}>
            Login
          </button>
        </div>
      </div>
    </nav>
    </div>
    {showInfoBox && !user && <InfoBox close={() => {setShowInfoBox(false); setIsBlurred(false);}} />}
    {searchResults && <SuperheroSearch superheroes={searchResults} />}
    </div>
  );
}
export default SearchBox;
