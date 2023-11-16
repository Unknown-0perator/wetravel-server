const knex = require('knex')(require('../knexfile'));
const express = require('express')
const router = express.Router();
const { v4: uuid } = require('uuid')

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).send('Unauthorized');
};

router.post('/new-plan', isAuthenticated, async (req, res) => {
    try {
        const { user_id, city, start_date, end_date, country } = req.body;
        if (!city || !start_date || !end_date) {
            return res.status(400).send('Bad Request: Missing required fields.');
        }
        const newPlan = {
            plan_id: uuid(),
            user_id,
            city,
            start_date,
            end_date,
            country
        };
        await knex('plan').insert(newPlan);
        res.status(201).send('Created');
    } catch (error) {
        console.error('Error creating new plan:', error);
        res.status(500).send('Internal Server Error');
    }
});