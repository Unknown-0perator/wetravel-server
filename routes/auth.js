const knex = require('knex')(require('../knexfile'));
const express = require('express');
const router = express.Router();
const passport = require('passport');


router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return res.status(500).json({ message: "Internal Server Error" });
        }
        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        req.logIn(user, (err) => {
            if (err) {
                return res.status(500).json({ message: "Error logging in" });
            }
            const userData = {
                user_id: user.user_id,
                user_name: user.user_name,
                email: user.email
            };
            return res.status(200).json({ message: "Logged in successfully", user: userData });
        });
    })(req, res, next);
});

router.get('/user', (req, res) => {
    res.send(req.user)
})

router.post('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ message: `Failed to logout due to: ${err}` });
        }

        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ message: 'Failed to logout due to server error' });
            }
            return res.json({ message: 'Logged out successfully' });
        });
    });
});


module.exports = router;