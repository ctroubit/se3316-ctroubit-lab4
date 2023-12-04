const { MongoClient } = require(`mongodb`)

const MONGODB_URI = 'mongodb+srv://ctroubit:123SRGvnss@cluster0.yd13ep7.mongodb.net/'
let superheroesDb;
let userInfoDb;

module.exports = {
  connectToDb: (cb) => {
    MongoClient.connect(MONGODB_URI)
      .then(client => {
        // Connect to the 'superheroes' database
        superheroesDb = client.db('superheroes');
        
        // Connect to the 'user-info' database
        userInfoDb = client.db('user-info');

        return cb();
      })
      .catch(err => {
        console.log(err);
        return cb(err);
      });
  },
  getSuperheroesDb: () => superheroesDb,
  getUserInfoDb: () => userInfoDb
};