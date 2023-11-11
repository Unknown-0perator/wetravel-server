const knex = require('knex')(require('../knexfile'));
const express = require('express');
const router = express.Router();
const passport = require('passport');


router.post('/login', passport.authenticate('local'))

module.exports = router;