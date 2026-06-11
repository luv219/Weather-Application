const express = require('express');
const axios = require('axios');
const https = require('https');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
app.use(cors());

const API_KEY = process.env.WEATHER_API_KEY;
const BASE_URL = 'https://api.weatherapi.com/v1/current.json';
const httpsAgent =
  process.env.ALLOW_INSECURE_SSL === 'true'
    ? new https.Agent({ rejectUnauthorized: false })
    : undefined;

app.get('/api/weather', async (req, res) => {
  const city = req.query.city;
  if (!city) return res.status(400).json({ error: 'City is required' });
  if (!API_KEY) return res.status(500).json({ error: 'Weather API key is not configured' });

  try {
    const response = await axios.get(BASE_URL, {
      params: {
        key: API_KEY,
        q: city
      },
      httpsAgent
    });

    const { location, current } = response.data;

    res.json({
      name: location.name,
      country: location.country,
      region: location.region,
      temp: current.temp_c,
      feelsLike: current.feelslike_c,
      humidity: current.humidity,
      windKph: current.wind_kph,
      description: current.condition.text,
      icon: current.condition.icon.startsWith('//')
        ? `https:${current.condition.icon}`
        : current.condition.icon
    });
  } catch (err) {
    const message = err.response?.data?.error?.message || 'Failed to fetch weather data';
    res.status(err.response?.status || 500).json({ error: message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
