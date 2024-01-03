require('dotenv').config();
const cors = require('cors');
const express = require('express');
const expressSession = require('express-session');
const passport = require('passport');

const app = express();
const { PORT, CORS_ORIGIN } = process.env;

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const planRoutes = require('./routes/plan');
const recommendRoutes = require('./routes/recommend');

app.use(cors({
    origin: CORS_ORIGIN,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middlewares
app.use(expressSession({ secret: process.env.MY_SECRET_KEY, resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

require('./strategies/local')(passport);

// Routes
app.get('/', (req, res) => {
    res.status(200).json({ message: "Welcome to WeTravel Server!" });
});
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/plan', planRoutes);
app.use('/recommend', recommendRoutes);

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
