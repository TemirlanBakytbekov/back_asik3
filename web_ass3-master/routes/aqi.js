// routes/aqi.js
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const { MongoClient } = require('mongodb');
const uri = 'mongodb+srv://temik20172:<U4f88tem1k!>@cluster0.gu7rxob.mongodb.net/';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

router.get('/aqi', async (req, res) => {
    const aqiCity = req.query.aqiCity;
    const aqiUrl = `https://api.waqi.info/feed/${aqiCity}/?token=9b90573dc33dc017127300f382dedf5500457360`;

    try {
        const aqiData = await fetch(aqiUrl).then(res => res.json());
        // Store aqiData with user and timestamp in MongoDB
        await client.connect();
        const db = client.db('openWeather');
        const collection = db.collection('aqiHistory');
        await collection.insertOne({
            username: req.session.username,
            aqiCity,
            aqiData,
            timestamp: new Date()
        });
        res.render('aqi', { aqiData, aqiCity });
    } catch (error) {
        console.error('Error fetching AQI data:', error);
        res.status(500).send('Internal Server Error');
    }
});
module.exports = router;
