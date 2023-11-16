const express = require('express');
const cookieParser = require('cookie-parser')
const session = require('express-session');
const passport = require('passport');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const planRoutes = require('./routes/plan');
const cors = require('cors');

require('dotenv').config();

const app = express();
const { PORT } = process.env;
const { CORS_ORIGIN } = process.env;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: CORS_ORIGIN }));

app.use(session({
    secret: 'your-secret-key',
    resave: true,
    saveUninitialized: true,
}));

app.use(cookieParser('your-secret-key'))



app.use(passport.initialize());
app.use(passport.session());
require('./strategies/local')(passport);

app.use((req, res, next) => {
    next();
});

// Routes
app.get('/', (req, res) => {
    res.status(200).json({ message: "Welcome to WeTravel Server!" });
});
app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/plan', planRoutes)

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
