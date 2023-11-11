const express = require('express');
const session = require('express-session');
const passport = require('passport');
const memoryStore = new session.MemoryStore();
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

app.use(session({
    secret: 'asddadAADSDFADSAFDSASF',
    resave: false,
    saveUninitialized: false,
    store: memoryStore,
}));

app.use(passport.initialize());
app.use(passport.session());

// Custom middleware, if needed, can be added here
app.use((req, res, next) => {
    next();
});

// Routes
app.use('/auth', authRoutes);
app.use('/user', userRoutes);

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
