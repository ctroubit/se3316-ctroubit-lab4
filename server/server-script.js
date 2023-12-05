const express = require('express');
const cors = require('cors')
const path = require('path');
const nodemailer = require('nodemailer');
const nev = require('email-verification')(require('mongoose'));
const mongoose  = require('mongoose')
const bcrypt = require('bcrypt');
const { body, query, param } = require('express-validator');
const {connectToDb, getUserInfoDb,getSuperheroesDb} = require('./db')

let db;
const port = 3000 || process.env.PORT

const app = express();
app.use(cors())
app.use(express.static(path.join(__dirname, '..', 'client')));
app.use(express.json())

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
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
        const { username, email, password } = req.body;
        console.log(req.body)

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

        const newUser = new User({ username, email, password: hashedPassword });
        console.log(newUser)
  
        
        await userInfodb.collection('login').insertOne(newUser);
  
      
      nev.createTempUser(newUser, function(err, existingPersistentUser, newTempUser) {
        if (err) {
          console.error('Error creating temp user:', err);
          return res.status(500).send('Internal Server Error 1 ');
        }
  
        if (existingPersistentUser) {
          return res.status(409).send('User already exists');
        }
  
        if (newTempUser) {
          var URL = newTempUser[nev.options.URLFieldName];
          nev.sendVerificationEmail(email, URL, function(err, info) {
            if (err) {
              console.error('Error sending verification email:', err);
              return res.status(500).send('Could not send verification email');
            }
            res.status(201).send('An email has been sent to you. Please check it to verify your account.');
          });

        } else {
          return res.status(200).send('An email has already been sent to this email.');
        }
      });
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


app.put('/api/lists/:listName'
    ,param('listName').escape(),async (req, res) => {
    try {
        const listName = req.params.listName;
        const superhero = req.body.superhero;

        const list = await superheroesDb.collection('lists').findOne({ listName });

        if (list) {
            await superheroesDb.collection('lists').updateOne(
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
        const existingList = await superheroesDb.collection('lists').findOne({ listName });

        if (existingList) {
            res.status(409).json({ error: 'A list with this name already exists.' });
        } else {
            const result = await superheroesDb.collection('lists').insertOne({ listName, superheroes });
            res.status(201).json(result);
        }
    } catch (err) {

        res.status(500).json(err);
    }
});


app.get('/api/lists', async (req, res) => {
    try {
        const lists = await superheroesDb.collection('lists').find({}).toArray();
        console.log(lists.listName)
        res.json(lists);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not fetch lists' });
    }
});

app.get('/api/lists/:listName', param('listName').escape(),async (req,res) =>{
    try{
        const list = await superheroesDb.collection('lists').find({listName: req.params.listName}).toArray()
        res.json(list)
    }catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Could not fetch lists' });
    }
})

app.delete('/api/lists/:listName' ,param('listName').escape(), async (req, res) => {
    try {
        const deletedList = await superheroesDb.collection('lists').findOneAndDelete({ listName: req.params.listName });
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