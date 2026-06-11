import { useState } from 'react';

export default function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    if (!city.trim()) return;

    setLoading(true);
    setError('');
    setWeather(null);

    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(city.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch weather');
      }

      setWeather(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <div className="card">
        <h1>Weather Application</h1>
        <p className="subtitle">Search for current weather by city</p>

        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Enter city name"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        {weather && (
          <div className="weather-result">
            <h2>
              {weather.name}, {weather.country}
            </h2>
            {weather.icon && (
              <img src={weather.icon} alt={weather.description} className="weather-icon" />
            )}
            <p className="temperature">{Math.round(weather.temp)}°C</p>
            <p className="description">{weather.description}</p>
            <div className="details">
              <span>Feels like: {Math.round(weather.feelsLike)}°C</span>
              <span>Humidity: {weather.humidity}%</span>
              <span>Wind: {weather.windKph} km/h</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
