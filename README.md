# Weather Application

A full-stack weather app that lets you search for current weather by city. The React frontend talks to an Express backend, which fetches live data from [WeatherAPI.com](https://www.weatherapi.com/).

## Tech Stack

- **Frontend:** React, Vite
- **Backend:** Node.js, Express
- **API:** [WeatherAPI.com](https://www.weatherapi.com/)

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- A free API key from [WeatherAPI.com](https://www.weatherapi.com/signup.aspx)

## Project Structure

```
Weather-Application/
├── client/          # React frontend (Vite)
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       └── styles.css
└── server/          # Express API
    ├── index.js
    └── .env         # Your local config (not committed)
```

## Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Weather-Application
   ```

2. **Install dependencies**

   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

3. **Configure environment variables**

   Copy the example env file and add your API key:

   ```bash
   cd server
   cp .env.example .env
   ```

   Edit `server/.env`:

   ```env
   WEATHER_API_KEY=your_weatherapi_key_here
   PORT=5000
   ALLOW_INSECURE_SSL=false
   ```

   > Keep your real API key in `server/.env` only. Do not commit it to git.

## Running the App

Start the backend and frontend in separate terminals:

```bash
# Terminal 1 — API server (http://localhost:5000)
cd server
npm start

# Terminal 2 — React app (http://localhost:3000)
cd client
npm run dev
```

Open **http://localhost:3000** in your browser and search for a city.

## API

### `GET /api/weather?city={cityName}`

Returns current weather for the given city.

**Example response:**

```json
{
  "name": "London",
  "country": "United Kingdom",
  "region": "City of London, Greater London",
  "temp": 12.2,
  "feelsLike": 10.8,
  "humidity": 94,
  "windKph": 13.7,
  "description": "Light rain",
  "icon": "https://cdn.weatherapi.com/weather/64x64/day/296.png"
}
```

## Troubleshooting

**"Failed to fetch weather data" or SSL errors in Node**

Some Windows environments cannot verify HTTPS certificates from Node. Set this in `server/.env`:

```env
ALLOW_INSECURE_SSL=true
```

Use this for local development only.

**Port already in use**

If port 3000 is taken, Vite will try the next available port (e.g. 3001). Check the terminal output for the correct URL.

## Build for Production

```bash
cd client
npm run build
npm run preview
```
