const express = require('express');
const cors = require('cors')
const path = require('path');
const nodemailer = require('nodemailer');
const nev = require('email-verification')(require('mongoose'));
const mongoose  = require('mongoose')
const bcrypt = require('bcrypt');
const { body, query, param } = require('express-validator');
const {connectToDb, getUserInfoDb,getSuperheroesDb} = require('./db')

const port = 3000 || process.env.PORT

const app = express();
app.use(cors())
app.use(express.static(path.join(__dirname, '..', 'client')));
app.use(express.json())

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    lists: [{
        listName: String,
        superheroes: Array
    }],
    isEmailVerified:{type:Boolean},
    isActivated:{type:Boolean},
    isAdmin: {type:Boolean}
});

const User = mongoose.model('User', userSchema);

let userInfodb;
let superheroesDb;

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: 'cristian.troubitsin@gmail.com',
      pass: 'rgzt lrar zeml dguy'
    }
  });

  nev.configure({
    verificationURL: 'http://localhost:3000/email-verify?token=${URL}',
    persistentUserModel: User, 
    tempUserCollection: 'temporary_users',
    transportOptions: transporter,
    verifyMailOptions: {
      from: 'Do Not Reply <cristian.troubitsin@gmail.com>',
      subject: 'Please confirm account',
      html: 'Click the following link to confirm your account: <a href="${URL}">${URL}</a>',
      text: 'Please confirm your account by clicking the following link: ${URL}'
    }
  }, function (err, options) {
    if (err) {
      console.error('NEV configuration error:', err);
      return;
    }
    console.log('NEV configured: ' + (typeof options === 'object'));
  });


 nev.generateTempUserModel(User,function(err, tempUserModel) {
    if (err) {
        
        console.error('Error generating temp user model:', err);
    } else {
        
        console.log('Temp user model generated');
    }
});


  app.get('/email-verify', (req, res) => {
    const token = req.query.token;
    nev.confirmTempUser(token, function (err, user) {
      if (user) {
        res.json({
          msg: 'Your account has been successfully verified.'
        });
      } else {
        res.status(404).send('Verification token is invalid or has expired.');
      }
    });
  });

  app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password} = req.body;
        

        if (!username || !email || !password) {
            return res.status(400).send('All fields are required');
        }

        if (!userInfodb) {
            return res.status(500).send('Database connection not established');
        }

        const existingUser = await userInfodb.collection('login').findOne({ email: email });
        if (existingUser) {
        return res.status(409).send('User already exists');
        }   

        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ 
            username, 
            email, 
            password: hashedPassword, 
            lists:[],
            isEmailVerified:false,
            isActivated: true, 
            isAdmin: false 
        });
  
        await userInfodb.collection('login').insertOne(newUser);

        res.status(201).send('Account creation successful!');

    } catch (error) {
      console.error('Error in /api/register:', error);
      res.status(500).send('Internal Server Error 2');
    }
  });

  app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        
        if (!username || !password) {
            return res.status(400).send('Email and password are required');
        }

        
        const user = await userInfodb.collection('login').findOne({ username:username});
        if (!user) {
            return res.status(401).send('Invalid email or password');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send('Invalid email or password');
        }

        
        res.status(200).send('Login successful');
    } catch (error) {
        console.error('Error in /api/login:', error);
        res.status(500).send('Internal Server Error');
    }
});

  

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

            let matchingSuperheroes = await superheroesDb.collection('info').find(query).toArray();

            if (req.query.power) {
                if (matchingSuperheroes.length === 0) {
                    console.log('No matching superheroes found');
                    res.status(404).send('No matching superheroes found');
                    return;
                }

                const heroNames = matchingSuperheroes.map(hero => hero.name);

                const powers = await superheroesDb.collection('powers').find({ hero_names: { $in: heroNames } }).toArray();

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
        const infoCursor = superheroesDb.collection('info').find();

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
        const powerCursor = await superheroesDb.collection('powers').findOne({hero_names: name})
        res.status(200).json(powerCursor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not fetch data' });
    }
})

app.get('/api/superheroes/powers/:hero_names',
    param('hero_names').escape(),async(req,res)=>{
    try {
        const infoCursor = superheroesDb.collection('info').find();
        const powersCursor = superheroesDb.collection('powers').find();

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

        const matchingSuperheroes = await superheroesDb.collection('info').find(query).toArray();
        if (matchingSuperheroes.length === 0) {
            console.log(`No superheroes found for ${searchBy}: ${value}`);
            res.status(404).send(`No superheroes found for ${searchBy}: ${value}`);
            return;
        }

        const heroNames = matchingSuperheroes.map(hero => hero.name);
        const powers = await superheroesDb.collection('powers').find({ hero_names: { $in: heroNames } }).toArray();

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


app.put('/api/lists/:username/:listName', param('username').escape(), param('listName').escape(), async (req, res) => {
    try {
        const { username, listName } = req.params;
        const superhero = req.body.superhero;

        const user = await userInfodb.collection('login').findOne({ username: username });

        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const listExists = user.lists.some(list => list.listName === listName);

        if (listExists) {
            await userInfodb.collection('login').updateOne(
                { username: username, "lists.listName": listName },
                { $push: { "lists.$.superheroes": superhero } }
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


app.post('/api/lists', body('username').escape(), body('listName').escape(), async (req, res) => {
    const { username, listName, superheroes } = req.body;

    try {
        
        const user = await userInfodb.collection('login').findOne({ username: username });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        
        const listExists = user.lists.some(list => list.listName === listName);
        if (listExists) {
            return res.status(409).json({ error: 'A list with this name already exists for the user.' });
        }

        
        await userInfodb.collection('login').updateOne(
            { username: username },
            { $push: { lists: { listName, superheroes } } }
        );

        res.status(201).json({ message: 'List added successfully.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Could not add the list' });
    }
});



app.get('/api/lists/:username', async (req, res) => {
    try {
        const username = req.params.username;
        const user = await userInfodb.collection('login').findOne({ username: username });
        console.log(req.params.username)
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.json(user.lists);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not fetch lists' });
    }
});

app.delete('/api/lists/:username/:listName', param('username').escape(), param('listName').escape(), async (req, res) => {
    try {
        const { username, listName } = req.params;

        const user = await userInfodb.collection('login').findOne({ username: username });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const updatedUser = await userInfodb.collection('login').updateOne(
            { username: username },
            { $pull: { lists: { listName: listName } } }
        );

        

        res.json({ message: `List '${listName}' deleted successfully.` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not delete list' });
    }
});


connectToDb((err) => {
    if (err) {
        console.error('Failed to connect to the database:', err);
        return;
    }
    app.listen(port, () => {
        console.log(`Server is listening on port ${port}`);
        userInfodb = getUserInfoDb();
        superheroesDb = getSuperheroesDb();
        
    });
});