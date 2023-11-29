const express = require('express');
const cors = require('cors')
const path = require('path');
const { body, query, param } = require('express-validator');

const {connectToDb, getDb} = require('./db')

let db;
const port = 3000 || process.env.PORT


const app = express();
app.use(cors())
app.use(express.static(path.join(__dirname, '..', 'client')));
app.use(express.json())

app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname, "..", 'client', 'index.html'))
})

app.get('/api/superheroes',query('name').escape(),
    query('Race').escape(),
    query('Publisher').escape(),
    query('limit').isInt().optional(),
    query('power').escape(),
    async (req, res) => {
        try {
            let query = {};

            if (req.query.name) {
                query.name = { $regex: new RegExp(`^${req.query.name}`, 'i') };
            }

            if (req.query.Race) {
                query.Race = req.query.Race;
            }

            if (req.query.Publisher) {
                query.Publisher = req.query.Publisher;
            }

            let limit = req.query.limit ? parseInt(req.query.limit) : 0;

            console.log('Initial query:', query);

            let matchingSuperheroes = await db.collection('info').find(query).toArray();

            if (req.query.power) {
                if (matchingSuperheroes.length === 0) {
                    console.log('No matching superheroes found');
                    res.status(404).send('No matching superheroes found');
                    return;
                }

                const heroNames = matchingSuperheroes.map(hero => hero.name);

                const powers = await db.collection('powers').find({ hero_names: { $in: heroNames } }).toArray();

                matchingSuperheroes = matchingSuperheroes.filter(hero => {
                    const heroPowers = powers.find(power => power.hero_names.includes(hero.name));
                    const powerBeingLookedFor = req.query.power;

                    return heroPowers && heroPowers[powerBeingLookedFor] === 'True';
                });

                if (matchingSuperheroes.length === 0) {
                    console.log(`No matching superheroes found for power: ${req.query.power}`);
                    res.status(404).send(`No matching superheroes found for power: ${req.query.power}`);
                    return;
                }
            }

            if (limit > 0) {
                matchingSuperheroes = matchingSuperheroes.slice(0, limit);
            }

            console.log('Sending matching superheroes');
            res.status(200).json(matchingSuperheroes);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Could not fetch superhero data', message: error.message });
        }
    });


app.get('/api/superheroes/info',async(req,res)=>{
    try {
        const infoCursor = db.collection('info').find();

        const s_info_data = await infoCursor.toArray();

        res.status(200).json(s_info_data);
    

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not fetch data' });
    }
})

app.get('/api/superheroes/powers',async(req,res)=>{
    const name = "A-Bomb"
    try{
        const powerCursor = await db.collection('powers').findOne({hero_names: name})
        res.status(200).json(powerCursor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not fetch data' });
    }
})

app.get('/api/superheroes/powers/:hero_names',
    param('hero_names').escape(),async(req,res)=>{
    try {
        const infoCursor = db.collection('info').find();
        const powersCursor = db.collection('powers').find();

        const s_info_data = await infoCursor.toArray();
        const s_powers_data = await powersCursor.toArray();

        const combinedData = {
            superheroes: s_info_data,
            powers: s_powers_data
        };
        res.status(200).json(combinedData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not fetch data' });
    }
})

app.get('/api/superheroes/single/:searchBy/:value',
    param('searchBy').escape(),param('value').escape(),async (req, res) => {
    try {
        const searchBy = req.params.searchBy;
        const value = req.params.value;
        let query = {};

        switch (searchBy) {
            case 'id':
                query = { id: parseInt(value) };
                break;
            case 'name':
                query = { name: { $regex: new RegExp(`^${value}`, 'i') } };
                break;
            case 'power':
                query = { powers: { $elemMatch: { $eq: value, $eq: "True" } } };
                break;
            case 'publisher':
                query = { Publisher: value };
                break;
            case 'race':
                query = { Race: value };
                break;
            default:
                res.status(400).json({ error: 'Invalid search criteria' });
                return;
        }

        const matchingSuperheroes = await db.collection('info').find(query).toArray();
        if (matchingSuperheroes.length === 0) {
            console.log(`No superheroes found for ${searchBy}: ${value}`);
            res.status(404).send(`No superheroes found for ${searchBy}: ${value}`);
            return;
        }

        const heroNames = matchingSuperheroes.map(hero => hero.name);
        const powers = await db.collection('powers').find({ hero_names: { $in: heroNames } }).toArray();

        const combinedData = matchingSuperheroes.map(hero => {
            const heroPowers = powers.find(power => power.hero_names === hero.name);
            return {
                ...hero,
                powers: heroPowers ? heroPowers : {}
            };
        });

        res.status(200).json(combinedData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not fetch superhero data' });
    }
});


app.put('/api/lists/:listName'
    ,param('listName').escape(),async (req, res) => {
    try {
        const listName = req.params.listName;
        const superhero = req.body.superhero;

        const list = await db.collection('lists').findOne({ listName });

        if (list) {
            await db.collection('lists').updateOne(
                { listName },
                { $push: { superheroes: superhero } }
            );

            res.json({ message: `Superhero added to list '${listName}'` });
        } else {
            res.status(404).json({ error: `List '${listName}' not found.` });

        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not add superhero to list' });
    }
});

app.post('/api/lists',
    body('listName').escape(),
    body('superheroes').isArray(),
     async (req, res) => {
    const { listName, superheroes } = req.body;

    try {
        const existingList = await db.collection('lists').findOne({ listName });

        if (existingList) {
            res.status(409).json({ error: 'A list with this name already exists.' });
        } else {
            const result = await db.collection('lists').insertOne({ listName, superheroes });
            res.status(201).json(result);
        }
    } catch (err) {

        res.status(500).json(err);
    }
});


app.get('/api/lists', async (req, res) => {
    try {
        const lists = await db.collection('lists').find({}).toArray();
        console.log(lists.listName)
        res.json(lists);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not fetch lists' });
    }
});

app.get('/api/lists/:listName', param('listName').escape(),async (req,res) =>{
    try{
        const list = await db.collection('lists').find({listName: req.params.listName}).toArray()
        res.json(list)
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not fetch lists' });
    }
})

app.delete('/api/lists/:listName' ,param('listName').escape(), async (req, res) => {
    try {
        const deletedList = await db.collection('lists').findOneAndDelete({ listName: req.params.listName });
        if (!deletedList.value) {
            console.log(`List '${req.params.listName}' has been deleted.`);
        } else {
            console.log(`List '${req.params.listName}' not found.`);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not delete list' });
    }
});

app.put('/api/lists/sort/:listName', param('listName').escape(),async (req, res) => {
    try {
        const listName = req.params.listName;
        const list = await db.collection('lists').findOne({ listName });

        if (list && Array.isArray(list.superheroes)) {
            list.superheroes.sort((a, b) => a.name.localeCompare(b.name));
            await db.collection('lists').updateOne(
                { listName },
                { $set: { superheroes: list.superheroes } }
            );

            res.status(200).json(list.superheroes);
        } else {
            res.status(404).json({ error: `List '${listName}' not found or does not contain superheroes.` });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not update list' });
    }
});

connectToDb((err)=>{
    if(!err){
        app.listen(port,()=>console.log(`Listening on port ${port}...`))
        db = getDb()
    }
})