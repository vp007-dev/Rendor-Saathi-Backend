const express = require('express');
const axios = require('axios');
const router = express.Router();
const getDemandForecast = (weatherMain) => {
    switch (weatherMain) {
        case 'Clear':
            return { message: 'High Demand', reason: 'Clear skies are great for business!', icon: '☀️' };
        case 'Clouds':
        case 'Haze':
        case 'Mist':
            return { message: 'Normal Demand', reason: 'Partly cloudy, a regular day.', icon: '☁️' };
        case 'Rain':
        case 'Drizzle':
        case 'Thunderstorm':
            return { message: 'Low Demand', reason: 'Rain may keep customers away. Prepare less stock.', icon: '🌧️' };
        case 'Snow':
            return { message: 'Very Low Demand', reason: 'Snowfall expected. Business will be slow.', icon: '❄️' };
        default:
            return { message: 'Normal Demand', reason: 'Weather is moderate today.', icon: '😊' };
    }
};

router.get('/forecast', async (req, res) => {
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
        return res.status(400).json({ message: 'API Key is required.' });
    }

    const lat = 27.1767;
    const lon = 78.0081;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

    try {
        const response = await axios.get(url);
        const weatherMain = response.data.weather[0].main;
        
        const forecast = getDemandForecast(weatherMain);
        
        res.json(forecast);

    } catch (error) {
        console.error("Weather API error:", error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Could not fetch weather data.' });
    }
});

module.exports = router;
