import axios from 'axios';
import https from 'https';

const BASE_URL = 'https://api.weatherapi.com/v1/forecast.json';
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
      params: { 
        key: apiKey, 
        q: city, 
        days: 3, 
        aqi: 'yes', 
        alerts: 'yes' 
      },
      httpsAgent
    });

    const { location, current, forecast, alerts } = response.data;

    // US EPA Index mapping: 1 = Good, 2 = Moderate, 3 = Poor/Unhealthy for sensitive groups, 4 = Unhealthy, 5 = Severe, 6 = Hazardous
    const epaIndex = current.air_quality?.['us-epa-index'] || 1;
    const aqiLabels = {
      1: 'Good',
      2: 'Moderate',
      3: 'Poor',
      4: 'Unhealthy',
      5: 'Severe',
      6: 'Hazardous'
    };
    const aqiText = aqiLabels[epaIndex] || 'Unknown';

    // Collect all hourly data across the 3 forecast days
    const allHours = [];
    forecast?.forecastday?.forEach(day => {
      if (day.hour) {
        day.hour.forEach(h => {
          allHours.push({
            time: h.time,
            timeEpoch: h.time_epoch,
            tempC: h.temp_c,
            tempF: h.temp_f,
            condition: {
              text: h.condition.text,
              icon: h.condition.icon.startsWith('//') ? `https:${h.condition.icon}` : h.condition.icon
            },
            isDay: h.is_day
          });
        });
      }
    });

    // Filter hours starting from the current hour of the location's local time
    const localEpoch = location.localtime_epoch;
    const currentHourStartEpoch = localEpoch - (localEpoch % 3600);

    const hourlyData = allHours
      .filter(h => h.timeEpoch >= currentHourStartEpoch)
      .slice(0, 24);

    // Format 3-day forecast
    const forecastDays = forecast?.forecastday?.map(day => ({
      date: day.date,
      maxTempC: day.day.maxtemp_c,
      minTempC: day.day.mintemp_c,
      maxTempF: day.day.maxtemp_f,
      minTempF: day.day.mintemp_f,
      condition: {
        text: day.day.condition.text,
        icon: day.day.condition.icon.startsWith('//') ? `https:${day.day.condition.icon}` : day.day.condition.icon
      },
      sunrise: day.astro?.sunrise,
      sunset: day.astro?.sunset,
      chanceOfRain: day.day.daily_chance_of_rain,
      chanceOfSnow: day.day.daily_chance_of_snow
    })) || [];

    // Format alerts
    const activeAlerts = alerts?.alert?.map(alert => ({
      event: alert.event,
      headline: alert.headline,
      severity: alert.severity,
      description: alert.description,
      expires: alert.expires
    })) || [];

    return res.status(200).json({
      name: location.name,
      country: location.country,
      region: location.region,
      localTime: location.localtime,
      current: {
        tempC: current.temp_c,
        tempF: current.temp_f,
        feelsLikeC: current.feelslike_c,
        feelsLikeF: current.feelslike_f,
        humidity: current.humidity,
        windKph: current.wind_kph,
        windMph: current.wind_mph,
        windDir: current.wind_dir,
        pressureMb: current.pressure_mb,
        pressureIn: current.pressure_in,
        visKm: current.vis_km,
        visMiles: current.vis_miles,
        uv: current.uv,
        condition: {
          text: current.condition.text,
          icon: current.condition.icon.startsWith('//')
            ? `https:${current.condition.icon}`
            : current.condition.icon
        },
        airQuality: {
          pm2_5: Math.round(current.air_quality?.pm2_5 || 0),
          pm10: Math.round(current.air_quality?.pm10 || 0),
          epaIndex,
          label: aqiText
        }
      },
      forecast: forecastDays,
      hourly: hourlyData,
      alerts: activeAlerts
    });
  } catch (err) {
    const message = err.response?.data?.error?.message || 'Failed to fetch weather data';
    return res.status(err.response?.status || 500).json({ error: message });
  }
}
