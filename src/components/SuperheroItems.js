import React from 'react';

function SuperheroItem({ superhero }) {
  return (
    <div className="superheroItem">
      <h1>{superhero.name}</h1>
      {/* You can add more details here */}
      {/* <button onClick={() => addToMyList(superhero)}>Add to List</button> */}
    </div>
  );
}

export default SuperheroItem;