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

// all the post route should be in one API call
// Put request for editing events
router.post('/', isAuthenticated, (req, res) => {
    const { destination, start_date, end_date, events } = req.body;
    if (!destination || !start_date || !end_date) {
        return res.status(400).send('Bad Request: Missing required fields.');
    }
    const newTrip = {
        trip_id: uuid(),
        user_id: req.user.user_id,
        destination,
        start_date,
        end_date,
    };
    knex('trips').insert(newTrip)
        .then(() => {
            res.status(201).json({
                message: 'Created',
            });

        }).then(() => {
            if (events.length !== 0) {
                events.map(event => {
                    const newEvent = {
                        trip_id: newTrip.trip_id,
                        event_id: uuid(),
                        date: event.date,
                        event_time: event.event_time,
                        event_type: event.event_type,
                        event_description: event.event_description,
                    }
                    knex('trip_details').insert(newEvent).then(() => {
                        res.status(201).json({
                            message: 'Created',
                        });
                    }).catch(error => {
                        console.error('Error creating new event:', error);
                        res.status(500).json({ error: 'Internal Server Error' });
                    })
                })
            }
        })
        .catch(error => {
            console.error('Error creating new plan:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

router.get('/', isAuthenticated, (req, res) => {
    knex('trips').where({ user_id: req.user.user_id })
        .then((plans) => {
            res.status(200).json(plans)
        })
        .catch((err) => {
            res.status(500).json({ error: 'Internal Server Error' })
        });
});

router.get('/:trip_id', isAuthenticated, (req, res) => {
    knex('trips')
        .join('trip_details', 'trip_details.trip_id', 'trips.trip_id')
        .where({ 'trip_details.trip_id': req.params.trip_id })
        .select(
            'trips.trip_id',
            'user_id',
            'destination',
            'start_date',
            'end_date',
            'event_id',
            'date',
            'trip_details.event_type',
            'event_description',
            'event_time',
        )
        .orderBy('date', 'asc')
        .then((planDetails) => {
            if (planDetails.length === 0) {
                res.status(404).json({ error: `Plan with ID ${req.params.trip_id} doesn't exist` });
            } else {
                const tripDetails = {
                    trip_id: planDetails[0].trip_id,
                    user_id: planDetails[0].user_id,
                    destination: planDetails[0].destination,
                    start_date: planDetails[0].start_date,
                    end_date: planDetails[0].end_date,
                    days: [],
                };

                let currentDay = null;

                planDetails.forEach((detail) => {
                    if (currentDay !== detail.date) {
                        currentDay = detail.date;
                        tripDetails.days.push({
                            date: detail.date,
                            events: [],
                        });
                    }

                    tripDetails.days[tripDetails.days.length - 1].events.push({
                        event_id: detail.event_id,
                        event_type: detail.event_type,
                        event_description: detail.event_description,
                        event_time: detail.event_time,
                    });
                });

                res.status(200).json(tripDetails);
            }
        })
        .catch((err) => {
            console.error('Error retrieving plan details:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});



router.delete('/:plan_id/event/:event_id', isAuthenticated, (req, res) => {
    const { plan_id, event_id } = req.params
    knex('plan_details').where({ plan_id: plan_id }).andWhere({ event_id: event_id }).del().then(() => {
        res.status(204).json({})
    }).catch(error => {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    })
})

router.delete('/:plan_id', isAuthenticated, (req, res) => {
    knex('plans').where({ plan_id: req.params.plan_id }).del().then(() => {
        res.status(204).json({})
    }).catch(error => {
        console.error('Error deleting plan:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    })
})



module.exports = router;