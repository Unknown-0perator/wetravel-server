const knex = require('knex')(require('../knexfile'));
const express = require('express')
const router = express.Router();
const { v4: uuid } = require('uuid');

router.post('/', async (req, res) => {
    try {
        const { destination, start_date, end_date, events, user_id, notes } = req.body;

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
            notes,
        };

        await knex('trips').insert(newTrip);

        if (events && events.length !== 0) {
            const eventInserts = events.map(event => {

                return {
                    trip_id: newTrip.trip_id,
                    event_id: uuid(),
                    date: event.date,
                    event_time: event.event_time,
                    event_type: event.event_type,
                    event_description: event.event_description,
                };
            });

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
        const { destination, start_date, end_date, events, notes } = req.body;
        const tripId = req.params.trip_id;

        const updatedTrip = {
            destination,
            start_date,
            end_date,
            notes,
        };

        await knex.transaction(async (trx) => {

            await trx('trips').where({ trip_id: tripId }).update(updatedTrip);
            await trx('trip_details').where({ trip_id: tripId }).del();

            if (events && events.length !== 0) {
                const eventInserts = events.map(event => {

                    return {
                        trip_id: tripId,
                        event_id: uuid(),
                        date: event.date,
                        event_time: event.event_time,
                        event_type: event.event_type,
                        event_description: event.event_description,
                    };
                });
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
    const userId = req.query.user_id;
    try {
        const plans = await knex('trips').where({ user_id: userId });
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
            return;
        }
        const trip = {
            trip_id: tripsDB[0].trip_id,
            user_id: tripsDB[0].user_id,
            destination: tripsDB[0].destination,
            start_date: tripsDB[0].start_date,
            end_date: tripsDB[0].end_date,
            notes: tripsDB[0].notes,
            events: tripDetailsDB.map(detail => ({
                event_id: detail.event_id,
                date: detail.date,
                event_time: detail.event_time,
                event_type: detail.event_type,
                event_description: detail.event_description
            }))
        };
        res.status(200).json(trip);
    } catch (error) {
        console.error('Error retrieving trip:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.delete('/:trip_id/event/:event_id', async (req, res) => {
    try {
        const { trip_id, event_id } = req.params;

        // Check if the event exists
        const event = await knex('trip_details')
            .where({ trip_id, event_id })
            .first();

        if (!event) {
            return res.status(404).json({ error: `Event with ID ${event_id} for trip ID ${trip_id} not found.` });
        }

        // Delete the event
        await knex('trip_details')
            .where({ trip_id, event_id })
            .del();

        res.status(200).json({ message: `Event with ID ${event_id} for trip ID ${trip_id} successfully deleted.` });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({ error: `Internal Server Error: Unable to delete event with ID ${event_id} for trip ID ${trip_id}.` });
    }
});


router.delete('/:trip_id', async (req, res) => {
    try {
        const { trip_id } = req.params;

        const tripExists = await knex('trips').where({ trip_id }).first();
        if (!tripExists) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        // Delete trip details first and then the trip
        await knex('trip_details').where({ trip_id }).del();
        const deletedRows = await knex('trips').where({ trip_id }).del();
        
        if (deletedRows === 0) {
            return res.status(404).json({ message: 'Trip not found' });
        } else {
            res.status(200).json({ message: `Trip with ID ${trip_id} deleted successfully` });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;