const knex = require('knex')(require('../knexfile'));
const express = require('express')
const router = express.Router();
const { v4: uuid } = require('uuid');



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
        await knex('plans').insert(newPlan);
        res.status(201).json({ message: 'Created' });
    } catch (error) {
        console.error('Error creating new plan:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/', isAuthenticated, (req, res) => {
    knex('plans').where({ user_id: req.user.user_id })
        .then((plans) => {
            res.status(200).json(plans || [])
        })
        .catch((err) => {
            res.status(500).json({ error: 'Internal Server Error' })
        });
});

router.get('/:plan_id', isAuthenticated, (req, res) => {
    knex('plans')
        .join('plan_details', 'plan_details.plan_id', 'plans.plan_id')
        .where({ 'plans.plan_id': req.params.plan_id })
        .select('plan_details.plan_id', 'event_id', 'date', 'time', 'activity')
        .then((planDetails) => {
            if (planDetails.length === 0) {
                res.status(404).json({ error: `Plan with ID ${req.params.plan_id} doesn't exist` });
            } else {
                res.status(200).json(planDetails);
            }
        })
        .catch((err) => {
            console.error('Error retrieving plan details:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

router.post('/:plan_id/event', isAuthenticated, (req, res) => {
    const { date, time, event } = req.body;
    if (!date || !time || !event) {
        return res.status(400).send('Bad Request: Missing required fields (date, time, event).');
    }
    const newEvent = {
        plan_id: req.params.plan_id,
        user_id: req.user.user_id,
        date,
        time,
        event
    }
    knex('plan_details').insert(newEvent).then(() => {
        res.status(201).json({ message: 'Created' })
    }).catch((error) => {
        console.error('Error creating new event:', error)
        res.status(500).json({ error: 'Internal Server Error' })
    })
})

router.delete('/:plan_id/event/:event_id')

router.delete('/:plan_id')


module.exports = router;