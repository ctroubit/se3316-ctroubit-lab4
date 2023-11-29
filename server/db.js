const { MongoClient } = require(`mongodb`)

const MONGODB_URI = 'mongodb+srv://ctroubit:123SRGvnss@cluster0.yd13ep7.mongodb.net/'
let dbConnect;

module.exports = {
    connectToDb: (cb) =>{
        MongoClient.connect(MONGODB_URI)
            .then((client) => {
            dbConnect = client.db('superheroes')
                return cb()
        }).catch(err =>{
            console.log(err)
            return cb(err)
        })
    },
    getDb: () => dbConnect
}