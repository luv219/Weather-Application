import { useState, useEffect } from 'react';

export default function App() {
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [unit, setUnit] = useState('metric'); // 'metric' (C) or 'imperial' (F)
  const [recentSearches, setRecentSearches] = useState([]);
  const [favorites, setFavorites] = useState([]);

  // Load favorites & search history on mount
  useEffect(() => {
    const savedRecent = localStorage.getItem('skyflow_recent');
    const savedFavorites = localStorage.getItem('skyflow_favorites');
    if (savedRecent) setRecentSearches(JSON.parse(savedRecent));
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
  }, []);

  // Fetch initial weather on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('skyflow_favorites');
    const savedRecent = localStorage.getItem('skyflow_recent');
    
    let defaultCity = 'New York';
    if (savedFavorites) {
      const favList = JSON.parse(savedFavorites);
      if (favList.length > 0) defaultCity = favList[0];
    } else if (savedRecent) {
      const recList = JSON.parse(savedRecent);
      if (recList.length > 0) defaultCity = recList[0];
    }
    
    fetchWeather(defaultCity);
  }, []);

  async function fetchWeather(searchQuery) {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/weather?city=${encodeURIComponent(searchQuery.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch weather data');
      }

      setWeather(data);
      
      // Update recent searches
      // Don't add coordinates as recent search name; use the formatted city name from response
      const cityName = data.name;
      setRecentSearches(prev => {
        const filtered = prev.filter(c => c.toLowerCase() !== cityName.toLowerCase());
        const updated = [cityName, ...filtered].slice(0, 5);
        localStorage.setItem('skyflow_recent', JSON.stringify(updated));
        return updated;
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    fetchWeather(city);
  }

  // Request browser geolocation
  function handleGeolocation() {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setLoading(true);
    setError('');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        fetchWeather(`${latitude},${longitude}`);
      },
      (err) => {
        setLoading(false);
        if (err.code === 1) {
          setError('Location access denied. Please enter a city name.');
        } else {
          setError('Unable to retrieve location. Please enter a city name.');
        }
      },
      { timeout: 8000 }
    );
  }

  // Toggle favorite status
  function toggleFavorite(cityName) {
    let updated;
    const isFav = favorites.some(c => c.toLowerCase() === cityName.toLowerCase());
    
    if (isFav) {
      updated = favorites.filter(c => c.toLowerCase() !== cityName.toLowerCase());
    } else {
      updated = [...favorites, cityName];
    }
    
    setFavorites(updated);
    localStorage.setItem('skyflow_favorites', JSON.stringify(updated));
  }

  // Remove city from recent searches
  function removeRecent(e, cityName) {
    e.stopPropagation();
    const updated = recentSearches.filter(c => c.toLowerCase() !== cityName.toLowerCase());
    setRecentSearches(updated);
    localStorage.setItem('skyflow_recent', JSON.stringify(updated));
  }

  // Format hour label ("2026-06-11 14:00" -> "2 PM")
  function formatHour(timeStr) {
    if (!timeStr) return '';
    const parts = timeStr.split(' ');
    if (parts.length < 2) return timeStr;
    const timePart = parts[1];
    const hour = parseInt(timePart.split(':')[0], 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12} ${ampm}`;
  }

  // Format day label ("2026-06-11" -> "Thu")
  function formatDayName(dateStr, index) {
    if (index === 0) return 'Today';
    // Use split to avoid UTC date offset issues
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const date = new Date(parts[0], parts[1] - 1, parts[2]);
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
    return dateStr;
  }

  // Get background gradient theme based on weather text
  function getWeatherThemeClass(desc) {
    if (!desc) return 'bg-default';
    const lower = desc.toLowerCase();
    if (lower.includes('sunny') || lower.includes('clear')) return 'bg-sunny';
    if (lower.includes('rain') || lower.includes('drizzle') || lower.includes('shower') || lower.includes('thunderstorm') || lower.includes('precip')) return 'bg-rainy';
    if (lower.includes('snow') || lower.includes('blizzard') || lower.includes('sleet') || lower.includes('ice') || lower.includes('hail')) return 'bg-snowy';
    if (lower.includes('cloud') || lower.includes('overcast') || lower.includes('mist') || lower.includes('fog')) return 'bg-cloudy';
    return 'bg-default';
  }

  // Air Quality rating background mapping
  function getAqiColor(index) {
    switch (index) {
      case 1: return 'var(--accent-emerald)'; // Good
      case 2: return 'var(--accent-amber)';   // Moderate
      case 3: return 'var(--accent-amber)';   // Poor
      case 4: return 'var(--accent-rose)';    // Unhealthy
      case 5: return 'var(--accent-rose)';    // Severe
      case 6: return 'var(--accent-purple)';  // Hazardous
      default: return 'var(--text-muted)';
    }
  }

  const isMetric = unit === 'metric';
  const weatherTheme = weather ? getWeatherThemeClass(weather.current.condition.text) : 'bg-default';

  return (
    <div className={`app-container ${weatherTheme}`}>
      <div className="dashboard-wrapper">
        
        {/* Header Section */}
        <header>
          <div className="brand-section">
            <div className="brand-title-group">
              <h1>Skyflow</h1>
              <p>Advanced Meteorological Dashboard</p>
            </div>
            
            <div className="unit-toggle-wrapper" onClick={() => setUnit(isMetric ? 'imperial' : 'metric')}>
              <button className={`unit-btn ${isMetric ? 'active' : ''}`}>°C</button>
              <button className={`unit-btn ${!isMetric ? 'active' : ''}`}>°F</button>
            </div>
          </div>

          {/* Search bar controls */}
          <div className="search-controls">
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Search location (e.g. London, Tokyo)"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                id="search-input"
              />
              <button type="submit" className="search-submit" aria-label="Submit search" id="search-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </button>
            </form>
            
            <button className="locate-btn" onClick={handleGeolocation} disabled={loading} title="Use current location" id="geolocation-button">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="3"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
              </svg>
              <span>Locate</span>
            </button>
          </div>

          {/* Recent Searches / Bookmarks */}
          {(recentSearches.length > 0 || favorites.length > 0) && (
            <div className="recent-searches">
              <span className="recent-title">Quick Access:</span>
              
              {/* Render Favorites first */}
              {favorites.map(favCity => (
                <div 
                  key={`fav-${favCity}`} 
                  className="recent-pill favorite"
                  onClick={() => { setCity(''); fetchWeather(favCity); }}
                >
                  ★ {favCity}
                  <button className="remove-recent" onClick={(e) => { e.stopPropagation(); toggleFavorite(favCity); }} title="Remove favorite">×</button>
                </div>
              ))}

              {/* Render Recent Searches (excluding favorites to avoid duplicates) */}
              {recentSearches
                .filter(c => !favorites.some(f => f.toLowerCase() === c.toLowerCase()))
                .map(recentCity => (
                  <div 
                    key={`rec-${recentCity}`} 
                    className="recent-pill"
                    onClick={() => { setCity(''); fetchWeather(recentCity); }}
                  >
                    {recentCity}
                    <button className="remove-recent" onClick={(e) => removeRecent(e, recentCity)} title="Remove recent">×</button>
                  </div>
                ))
              }
            </div>
          )}
        </header>

        {/* Weather Alerts Banner */}
        {weather && weather.alerts && weather.alerts.length > 0 && (
          <div className="alerts-banner" id="weather-alert-banner">
            {weather.alerts.map((alert, idx) => (
              <div key={`alert-${idx}`} className="alert-item">
                <div className="alert-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                  <span>{alert.event}</span>
                </div>
                <p className="alert-desc">{alert.headline || alert.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Main Loading / Error / Content Switcher */}
        {loading ? (
          <div className="glass-panel loading-wrapper" id="loading-spinner">
            <div className="spinner"></div>
            <p>Retrieving local meteorological metrics...</p>
          </div>
        ) : error ? (
          <div className="glass-panel error-panel" id="error-card">
            <p className="error-title">Search Failed</p>
            <p className="error-text">{error}</p>
            <button className="retry-btn" onClick={() => fetchWeather(weather ? weather.name : 'New York')}>
              Try Again
            </button>
          </div>
        ) : weather ? (
          
          <div className="dashboard-grid">
            
            {/* Left Column: Primary Stats Card */}
            <div className="left-panel">
              <div className="glass-panel primary-weather-card" id="primary-weather-card">
                
                {/* Favorite Star Button */}
                <button 
                  className={`favorite-star-btn ${favorites.some(f => f.toLowerCase() === weather.name.toLowerCase()) ? 'active' : ''}`}
                  onClick={() => toggleFavorite(weather.name)}
                  title={favorites.some(f => f.toLowerCase() === weather.name.toLowerCase()) ? 'Remove from favorites' : 'Add to favorites'}
                  aria-label="Toggle favorite"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={favorites.some(f => f.toLowerCase() === weather.name.toLowerCase()) ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </button>

                <div className="location-info">
                  <h2>{weather.name}</h2>
                  <div className="region">{weather.region}, {weather.country}</div>
                  <div className="localtime">Local Time: {weather.localTime?.split(' ')[1] || ''}</div>
                </div>

                <div className="main-weather-visual">
                  <img 
                    src={weather.current.condition.icon} 
                    alt={weather.current.condition.text} 
                    className="weather-icon-large" 
                  />
                  <div className="large-temp">
                    {isMetric ? Math.round(weather.current.tempC) : Math.round(weather.current.tempF)}
                    <span style={{ fontSize: '2.5rem', verticalAlign: 'super', fontWeight: 600 }}>°</span>
                  </div>
                  <p className="condition-desc">{weather.current.condition.text}</p>
                </div>

                {/* Min / Max Temp Today */}
                {weather.forecast && weather.forecast[0] && (
                  <div className="temp-minmax">
                    <span className="high">
                      High: {isMetric ? Math.round(weather.forecast[0].maxTempC) : Math.round(weather.forecast[0].maxTempF)}°
                    </span>
                    <span className="low">
                      Low: {isMetric ? Math.round(weather.forecast[0].minTempC) : Math.round(weather.forecast[0].minTempF)}°
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Detailed Grid & Forecast Lists */}
            <div className="right-panel">
              
              {/* Hourly Forecast Scroller */}
              <div className="glass-panel" id="hourly-forecast-card">
                <h3 className="section-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  Hourly Tracker
                </h3>
                <div className="hourly-container">
                  {weather.hourly.map((h, index) => (
                    <div className="hourly-card" key={`hour-${index}`}>
                      <span className="hourly-time">{index === 0 ? 'Now' : formatHour(h.time)}</span>
                      <img src={h.condition.icon} alt={h.condition.text} className="hourly-icon" />
                      <span className="hourly-temp">{isMetric ? Math.round(h.tempC) : Math.round(h.tempF)}°</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed Meteorological Metrics Grid */}
              <div className="glass-panel" id="weather-metrics-card">
                <h3 className="section-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="3" width="7" height="9"></rect>
                    <rect x="14" y="3" width="7" height="5"></rect>
                    <rect x="14" y="12" width="7" height="9"></rect>
                    <rect x="3" y="16" width="7" height="5"></rect>
                  </svg>
                  Detailed Metrics
                </h3>
                
                <div className="metrics-grid">
                  
                  {/* Feels Like Temp */}
                  <div className="metric-card">
                    <div className="metric-header">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"></path>
                      </svg>
                      <span>Feels Like</span>
                    </div>
                    <div className="metric-value">
                      {isMetric ? Math.round(weather.current.feelsLikeC) : Math.round(weather.current.feelsLikeF)}°
                    </div>
                    <div className="metric-sub">Thermal sensation</div>
                  </div>

                  {/* Humidity */}
                  <div className="metric-card">
                    <div className="metric-header">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                      </svg>
                      <span>Humidity</span>
                    </div>
                    <div className="metric-value">{weather.current.humidity}%</div>
                    <div className="metric-sub">Water vapor concentration</div>
                  </div>

                  {/* Wind speed & dir */}
                  <div className="metric-card">
                    <div className="metric-header">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path>
                      </svg>
                      <span>Wind</span>
                    </div>
                    <div className="metric-value">
                      {isMetric ? `${Math.round(weather.current.windKph)} km/h` : `${Math.round(weather.current.windMph)} mph`}
                    </div>
                    <div className="metric-sub">Direction: {weather.current.windDir}</div>
                  </div>

                  {/* UV Index */}
                  <div className="metric-card">
                    <div className="metric-header">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="5"></circle>
                        <line x1="12" y1="1" x2="12" y2="3"></line>
                        <line x1="12" y1="21" x2="12" y2="23"></line>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                        <line x1="1" y1="12" x2="3" y2="12"></line>
                        <line x1="21" y1="12" x2="23" y2="12"></line>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                      </svg>
                      <span>UV Index</span>
                    </div>
                    <div className="metric-value">{weather.current.uv}</div>
                    <div className="metric-sub">
                      {weather.current.uv <= 2 ? 'Low exposure' : weather.current.uv <= 5 ? 'Moderate' : weather.current.uv <= 7 ? 'High' : 'Very High'}
                    </div>
                  </div>

                  {/* Air Quality PM2.5/PM10 */}
                  <div className="metric-card">
                    <div className="metric-header">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                      </svg>
                      <span>Air Quality</span>
                    </div>
                    <div className="metric-value" style={{ color: getAqiColor(weather.current.airQuality.epaIndex) }}>
                      <span className="metric-aqi-indicator" style={{ backgroundColor: getAqiColor(weather.current.airQuality.epaIndex) }}></span>
                      {weather.current.airQuality.label}
                    </div>
                    <div className="metric-sub">PM2.5: {weather.current.airQuality.pm2_5} µg/m³</div>
                  </div>

                  {/* Visibility */}
                  <div className="metric-card">
                    <div className="metric-header">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      <span>Visibility</span>
                    </div>
                    <div className="metric-value">
                      {isMetric ? `${weather.current.visKm} km` : `${weather.current.visMiles} mi`}
                    </div>
                    <div className="metric-sub">Atmospheric clarity</div>
                  </div>

                  {/* Sunset / Sunrise */}
                  <div className="metric-card">
                    <div className="metric-header">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 2v2M4.93 4.93l1.41 1.41M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM2 18h20M12 22v-2"></path>
                      </svg>
                      <span>Sunrise</span>
                    </div>
                    <div className="metric-value" style={{ fontSize: '1.25rem', paddingTop: '0.2rem' }}>
                      {weather.forecast?.[0]?.sunrise || 'N/A'}
                    </div>
                    <div className="metric-sub">Daybreak threshold</div>
                  </div>

                  {/* Sunset */}
                  <div className="metric-card">
                    <div className="metric-header">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 18a5 5 0 0 0-10 0M2 18h20M12 2v2M4.93 4.93l1.41 1.41M19.07 4.93l-1.41 1.41"></path>
                      </svg>
                      <span>Sunset</span>
                    </div>
                    <div className="metric-value" style={{ fontSize: '1.25rem', paddingTop: '0.2rem' }}>
                      {weather.forecast?.[0]?.sunset || 'N/A'}
                    </div>
                    <div className="metric-sub">Nightfall threshold</div>
                  </div>

                  {/* Atmospheric Pressure */}
                  <div className="metric-card">
                    <div className="metric-header">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 6v6l4 2"></path>
                      </svg>
                      <span>Pressure</span>
                    </div>
                    <div className="metric-value" style={{ fontSize: '1.35rem', paddingTop: '0.1rem' }}>
                      {isMetric ? `${weather.current.pressureMb} hPa` : `${weather.current.pressureIn} inHg`}
                    </div>
                    <div className="metric-sub">Barometric pressure</div>
                  </div>

                </div>
              </div>

              {/* 3-Day Forecast Section */}
              <div className="glass-panel" id="daily-forecast-card">
                <h3 className="section-title">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  3-Day Outlook
                </h3>
                
                <div className="forecast-list">
                  {weather.forecast.map((day, idx) => (
                    <div className="forecast-row" key={`day-${idx}`}>
                      <span className="forecast-day">{formatDayName(day.date, idx)}</span>
                      <img src={day.condition.icon} alt={day.condition.text} className="forecast-icon" />
                      <span className="forecast-desc" title={day.condition.text}>{day.condition.text}</span>
                      <div className="forecast-temps">
                        <span className="max">
                          {isMetric ? Math.round(day.maxTempC) : Math.round(day.maxTempF)}°
                        </span>
                        <span className="min">
                          {isMetric ? Math.round(day.minTempC) : Math.round(day.minTempF)}°
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        ) : (
          <div className="glass-panel empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"></path>
            </svg>
            <h3>No Meteorological Data</h3>
            <p>Use the search input above to lookup current conditions or click Geolocation to query your local coordinates.</p>
          </div>
        )}

        <footer>
          <p>© {new Date().getFullYear()} Skyflow Weather Portal. Built using real-time atmospheric data models.</p>
        </footer>

      </div>
    </div>
  );
}
