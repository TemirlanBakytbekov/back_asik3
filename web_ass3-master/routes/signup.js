const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://mustiksarva:table1234554321@mailing.qungyk9.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect();

router.get('/signup', (req, res) => {
    res.render('singup');
});

router.post('/signup', async (req, res) => {
    const { username, password } = req.body;

    try {
        const db = client.db('openWeather');
        const usersCollection = db.collection('users');

        const existingUser = await usersCollection.findOne({ username });

        if (existingUser) {
            return res.status(400).send('Username already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let isAdmin = false;

        if (username == "mustafaS" && password == "mustafa123") {
            isAdmin = true;
        }

        const newUser = await usersCollection.insertOne({
            username,
            password: hashedPassword,
            isAdmin: isAdmin 
        });

        res.redirect('/login');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
