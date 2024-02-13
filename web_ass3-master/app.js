const express = require('express');
const session = require('express-session');
const path = require('path');
const isAdmin = require('./middleware/isAdmin'); 
const app = express();
const port = 3000;

// Set up session middleware
app.use(session({
    secret: 'mustik`s secret key', // Change this to a random string
    resave: false,
    saveUninitialized: false
  }));  

// Set view engine and views directory
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

// Serve static files from 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// Use weather router to handle weather related queries
const weather = require('./routes/weather');
const register = require('./routes/signup');
const login = require('./routes/login');
const logout = require('./routes/logout')
const aqiRoute = require('./routes/aqi');
const adminRoutes = require('./routes/admin');

// Use these routes by weather app
app.use(weather);
app.use(register);
app.use(login);
app.use(logout);
app.use(aqiRoute);
app.use('/admin', isAdmin, adminRoutes);


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
