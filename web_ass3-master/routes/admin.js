const express = require('express');
const router = express.Router();
const isAdmin = require('../middleware/isAdmin');
const bcrypt = require('bcryptjs'); 

const { MongoClient } = require('mongodb');
const { ObjectId } = require('mongodb');

const uri = 'mongodb+srv://mustiksarva:table1234554321@mailing.qungyk9.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect();

// Admin dashboard - Display users
router.get('/', isAdmin, async (req, res) => {
    try {
        const db = client.db('openWeather');
        const usersCollection = db.collection('users');
        const users = await usersCollection.find({}).toArray();
        res.render('adminDashboard', { users });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/users/new', isAdmin, async (req, res) => {
    res.render('addNewUser'); 
});


// Add user
router.post('/users', isAdmin, async (req, res) => {
    let { username, password, isAdmin: adminFlag } = req.body; 
    try {
        const db = client.db('openWeather');
        const usersCollection = db.collection('users');

        const existingUser = await usersCollection.findOne({ username });
        if (existingUser) {
            return res.status(400).send('Username already exists');
        }

        if (adminFlag) {``
            adminFlag = true
        } else {
            adminFlag = false
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await usersCollection.insertOne({
            username,
            password: hashedPassword,
            isAdmin: adminFlag || false, 
        });

        res.redirect('/admin');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to show the edit user form
router.get('/users/edit/:id', isAdmin, async (req, res) => {
    try {
        const db = client.db('openWeather');
        const usersCollection = db.collection('users');
        const user = await usersCollection.findOne({ _id: new ObjectId(req.params.id) });

        if (!user) {
            return res.status(404).send('User not found');
        }

        res.render('edit', { user }); // Assuming you have an editUser.ejs view
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Edit user - Note: This example does not provide a UI for editing
router.post('/users/:id', isAdmin, async (req, res) => {
    const { username, password, isAdmin: adminFlag } = req.body;
    try {
        const db = client.db('openWeather');
        const usersCollection = db.collection('users');

        const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;
        const updateDoc = { $set: {} };
        if (username) updateDoc.$set.username = username;
        if (hashedPassword) updateDoc.$set.password = hashedPassword;
        if (adminFlag !== undefined) updateDoc.$set.isAdmin = adminFlag;

        await usersCollection.updateOne({ _id: new ObjectId(req.params.id) }, updateDoc);

        res.redirect('/admin');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Delete user
router.post('/users/:id', isAdmin, async (req, res) => {
    try {
        const db = client.db('openWeather');
        const usersCollection = db.collection('users');
        await usersCollection.deleteOne({ _id: new ObjectId(req.params.id) });
        res.redirect('/admin');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;
