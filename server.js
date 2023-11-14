const express = require('express');
const cookieParser = require('cookie-parser')
const session = require('express-session');
const passport = require('passport');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const cors = require('cors');
require('./strategies/local');
require('dotenv').config();

const app = express();
const { PORT } = process.env;
const { CORS_ORIGIN } = process.env;
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser())
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: new session.MemoryStore({
        checkPeriod: 86400000,
    }),
    cookie: {
        maxAge: 24 * 60 * 60 * 1000,
        secure: false,
        httpOnly: true,
    },
}));



app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
    next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
