const knex = require('knex')(require('../knexfile'));
const express = require('express')
const router = express.Router();
const { v4: uuid } = require('uuid');

router.post('/', async (req, res) => {
    console.log(req.body);
    try {
        const { destination, start_date, end_date, events, user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({ error: 'User ID is missing' });
        }

        if (!destination || !start_date || !end_date) {
            return res.status(400).send('Bad Request: Missing required fields.');
        }

        const newTrip = {
            trip_id: uuid(),
            user_id: user_id,
            destination,
            start_date,
            end_date,
        };

        await knex('trips').insert(newTrip);

        if (events && events.length !== 0) {
            const eventInserts = events.map(event => ({
                trip_id: newTrip.trip_id,
                event_id: uuid(),
                date: event.date,
                event_time: event.event_time,
                event_type: event.event_type,
                event_description: event.event_description,
            }));

            await knex('trip_details').insert(eventInserts);
        }

        res.status(201).json({
            message: 'Created',
        });
    } catch (error) {
        console.error('Error creating new plan:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.put('/:trip_id', async (req, res) => {
    try {
        const { destination, start_date, end_date, events } = req.body;
        const tripId = req.params.trip_id;

        const updatedTrip = {
            destination,
            start_date,
            end_date,
        };

        await knex.transaction(async (trx) => {

            await trx('trips').where({ trip_id: tripId }).update(updatedTrip);

            await trx('trip_details').where({ trip_id: tripId }).del();

            if (events && events.length !== 0) {
                const eventInserts = events.map(event => ({
                    trip_id: tripId,
                    event_id: uuid(),
                    date: event.date,
                    event_time: event.event_time,
                    event_type: event.event_type,
                    event_description: event.event_description,
                }));
                await trx('trip_details').insert(eventInserts);
            }
        });
        res.status(200).json({
            message: 'Updated',
        });
    } catch (error) {
        console.error('Error updating trip:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/', async (req, res) => {
    try {
        const plans = await knex('trips').where({ user_id: req.user.user_id });
        res.status(200).json(plans);
    } catch (error) {
        console.error('Error retrieving trips:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.get('/:trip_id', async (req, res) => {
    try {
        const { trip_id } = req.params
        const tripDetailsDB = await knex('trip_details')
            .where({ trip_id: trip_id })
            .orderBy('date', 'asc');

        const tripsDB = await knex('trips').where({ trip_id: trip_id })

        if (tripsDB.length === 0) {
            res.status(404).json({ error: `Plan with ID ${req.params.trip_id} doesn't exist` });
        } else {
            const tripDetails = {
                trip_id: tripsDB[0].trip_id,
                user_id: tripsDB[0].user_id,
                destination: tripsDB[0].destination,
                start_date: tripsDB[0].start_date,
                end_date: tripsDB[0].end_date,
                days: [],
            };
            if (tripDetailsDB.length !== 0) {


                let currentDay = null;

                tripDetailsDB.forEach((detail) => {
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
            }
            res.status(200).json(tripDetails);
        }
    } catch (error) {
        console.error('Error retrieving plan details:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.delete('/:trip_id/event/:event_id', async (req, res) => {
    try {
        const { trip_id, event_id } = req.params;
        await knex('trip_details')
            .where({ trip_id, event_id })
            .del();
        res.status(204).json({});
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/:trip_id', async (req, res) => {
    try {
        const { trip_id } = req.params;
        await knex('trip_details').where({ trip_id }).del();
        await knex('trips').where({ trip_id }).del();
        res.status(204).json({});
    } catch (error) {
        console.error('Error Deleting Trip:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


module.exports = router;