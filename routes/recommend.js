const knex = require('knex')(require('../knexfile'));
const express = require('express');
const router = express.Router();
const { createApi } = require('unsplash-js');
const OpenAI = require('openai')

const openai = new OpenAI({ api_key: process.env.OPENAI_API_KEY })

const unsplash = createApi({
    accessKey: process.env.UNSPLASH_API_KEY
});



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
           immerse in the local culture while traveling. Return response in the in the following parsable JSON format:

           [ {"city": "first_destination_name", "country": "first_destination_country_name" }, ...]
        `;


        const result = await openai.completions.create({
            model: 'gpt-3.5-turbo-instruct',
            prompt: prompt,
            max_tokens: 2048,
            temperature: 1
        })

        const parsableJSONresponse = result.choices[0].text
        const parsedResponse = JSON.parse(parsableJSONresponse)
        await Promise.all(parsedResponse.map(async city => {
            const unsplashResult = await unsplash.search.getPhotos({ query: city.city, page: 1, perPage: 1 });
            if (unsplashResult.type === 'success') {
                const firstPhoto = unsplashResult.response.results[0];
                city.photo_url = firstPhoto.urls.regular;
                city.photo_description = firstPhoto.alt_description;
            }
        }));

        res.status(200).json(parsedResponse);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
