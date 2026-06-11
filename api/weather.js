import axios from 'axios';
import https from 'https';

const BASE_URL = 'https://api.weatherapi.com/v1/current.json';
const httpsAgent =
  process.env.ALLOW_INSECURE_SSL === 'true'
    ? new https.Agent({ rejectUnauthorized: false })
    : undefined;

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const city = req.query.city;
  const apiKey = process.env.WEATHER_API_KEY;

  if (!city) {
    return res.status(400).json({ error: 'City is required' });
  }

  if (!apiKey) {
    return res.status(500).json({ error: 'Weather API key is not configured' });
  }

  try {
    const response = await axios.get(BASE_URL, {
      params: { key: apiKey, q: city },
      httpsAgent
    });

    const { location, current } = response.data;

    return res.status(200).json({
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
    return res.status(err.response?.status || 500).json({ error: message });
  }
}
