const knex = require('knex')(require('../knexfile'));
const express = require('express');
const router = express.Router();
const passport = require('passport');


router.post('/login', passport.authenticate('local', { failureRedirect: '/login' }), (req, res) => {
    res.status(200).json(req.user)
})

module.exports = router;