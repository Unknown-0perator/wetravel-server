const knex = require('knex')(require('../knexfile'));
const express = require('express');
const router = express.Router();
const { v4: uuid } = require('uuid')


router.post('/sign-up', (req, res) => {
    knex('users').where({ email: req.body.email }).then(response => {
        const user = response[0];
        if (!user) {
            const newUser = {
                user_id: uuid(),
                user_name: req.body.user_name,
                email: req.body.email,
                password: req.body.password,
            }
            const newQuestionnaire = {
                questionnaire_id: uuid(),
                user_id: newUser.user_id,
                traveler_type: req.body.traveler_type,
                food_type: req.body.food_type,
                food_rate: req.body.food_rate,
                activity_type: req.body.activity_type,
                climate_type: req.body.climate_type,
                hobby_type: req.body.hobby_type,
                culture_rate: req.body.culture_rate,
            }

            knex('users').insert(newUser).then((newUser) => {
                knex('questionnaire').insert(newQuestionnaire).then((newQuestionnaire) => {
                    res.status(201)
                }).catch((err) => {
                    res.status(err)
                })
                return res.status(201).json(newUser)
            }).catch((err) => {
                res.status(400).json(`Invalid: ${err}`)
            })
        }
        else {
            res.status(400).json(`User Already Exist`)
        }
    })

})