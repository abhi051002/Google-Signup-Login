require('dotenv').config();

const express = require('express');
const passport = require('passport');
const session = require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false, // we want to avoid resaving sessions that are not modified
    saveUninitialized: true, // this is for uninitialized sessions
}));

app.use(passport.initialize()); // Initialize Passport
app.use(passport.session()); // Mixed session support with express
app.use(express.json());

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://localhost:3000/auth/google/callback',
}, (accessToken, refreshToken, profile, done) => {
    // Here you would save the user to your database
    // For this example, we'll just return the profile
    return done(null, profile);
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.get('/', (req, res) => {
    res.send('Welcome to the home page! <a href="/auth/google">Login with Google</a>');
});

app.get('/auth/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}));

app.get('/auth/google/callback', passport.authenticate('google', {
    successRedirect: '/profile',
    failureRedirect: '/'
}));
app.get('/profile', (req, res) => {
    if (!req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.send(`Hello ${req.user.displayName}! <a href="/logout">Logout</a>`);
});
app.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
// This code sets up a simple Express server with Google OAuth authentication.
// It uses the GoogleStrategy from the passport-google-oauth20 package to authenticate users.
// The server has routes for logging in with Google, handling the callback, and displaying a profile page.
// The user is redirected to the home page if authentication fails.
// The server also includes a logout route that logs the user out and redirects them to the home page.
// Make sure to create a .env file with your Google credentials and session secret:
// GOOGLE_CLIENT_ID=your_google_client_id
// GOOGLE_CLIENT_SECRET=your_google_client_secret
// SESSION_SECRET=your_session_secret
// To run the server, use the command: node index.js
// Make sure to install the required packages:
// npm install express passport passport-google-oauth20 express-session dotenv
// You can test the server by visiting http://localhost:3000 in your browser.
// You should see a welcome message with a link to log in with Google.
// After logging in, you will be redirected to the profile page where you can see your name and a logout link.
// This code is a simple example of how to set up Google OAuth authentication in an Express application.
// You can expand this code by adding a database to store user information,
// implementing error handling, and customizing the user experience.