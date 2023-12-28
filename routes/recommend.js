const knex = require('knex')(require('../knexfile'));
const express = require('express');
const router = express.Router();

const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

router.post('/', async (req, res) => {
    try {
        const { destination_type, destination_scope, companionship_preference, trip_length, travel_month, user_id } = req.body;
        const questionnaireData = await knex('questionnaire').where({ user_id: user_id });
        if (questionnaireData.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const prompt = `
           I want to recommend me 5 ${destination_type} destinations for my vacation 
           ${destination_scope} with my ${companionship_preference} for ${trip_length} 
           specific in the month of ${travel_month} according to the following characteristics: 
           I live in ${questionnaireData[0].country}, I am a ${questionnaireData[0].traveler_type} traveler, 
           I like ${questionnaireData[0].food_type}, and food gastronomy is ${questionnaireData[0].food_rate} 
           for me. I enjoy ${questionnaireData[0].activity_type} activities. I prefer 
           ${questionnaireData[0].climate_type} weather. My specific travel interests are 
           ${questionnaireData[0].hobby_type}. It is ${questionnaireData[0].culture_rate} for me to 
           immerse in the local culture while traveling. in the json format with following structure 
           [ {city: first_destination_name, country: first_destination_country_name }, ]
        `;
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        const resultText = JSON.parse(text.replace(/^```json\n|```$/g, ''));
        res.status(200).json(resultText);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
