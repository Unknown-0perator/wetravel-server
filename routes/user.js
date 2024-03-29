const knex = require('knex')(require('../knexfile'));
const express = require('express');
const router = express.Router();
const { v4: uuid } = require('uuid')
const { hashPassword } = require('../utils/encrypt_decrypt-password');

router.post('/sign-up', (req, res) => {
    if (!req.body.email || !req.body.password || !req.body.user_name) {
        return res.status(400).json({ error: "Missing required user information." });
    }
    
    knex('users').where({ email: req.body.email }).then(async response => {
        if (response.length === 0) {
            const hashedPassword = await hashPassword(req.body.password);
            const userId = uuid();
            const newUser = {
                user_id: userId,
                user_name: req.body.user_name,
                email: req.body.email,
                password: hashedPassword,
            };

            try {
                await knex('users').insert(newUser);
                const newQuestionnaire = {
                    questionnaire_id: uuid(),
                    user_id: userId,
                    country: req.body.country,
                    traveler_type: req.body.traveler_type,
                    food_type: req.body.food_type,
                    food_rate: req.body.food_rate,
                    activity_type: req.body.activity_type,
                    climate_type: req.body.climate_type,
                    hobby_type: req.body.hobby_type,
                    culture_rate: req.body.culture_rate,
                };
                await knex('questionnaire').insert(newQuestionnaire);

                const userData = {
                    user_id: userId,
                    user_name: newUser.user_name,
                    email: newUser.email,
                };

                res.status(201).json({ message: "User Created Successfully", user: userData });
            } catch (err) {
                console.error("Failed to register user:", err);
                res.status(500).json({ error: 'Failed to register user.' });
            }
        } else {
            res.status(400).json({ message: "User Already Exists" });
        }
    }).catch((err) => {
        console.error("Server Error:", err);
        res.status(500).json({ error: "Server Error", details: err.message });
    });
});

module.exports = router;