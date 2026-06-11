# Skyflow — Premium Weather Dashboard

**Live Demo**: [skyflow-application.vercel.app](https://skyflow-application.vercel.app/)

Skyflow is a premium, high-fidelity meteorological dashboard built with React, Vite, and Node.js. It interfaces with [WeatherAPI.com](https://www.weatherapi.com/) to deliver real-time current conditions, 24-hour sequential trackers, 3-day forecasts, air quality indices, astronomical thresholds, and weather alerts.

Featuring a modern glassmorphic interface, dynamic background themes matched to current conditions, and persistent bookmarks, Skyflow brings desktop-grade weather metrics directly to the browser.

---

## Key Features

- **High-Fidelity UI**: Frosted glassmorphism layout, subtle borders, custom modern typography, and smooth transitions.
- **Dynamic Themes**: Interactive animated backgrounds that shift gradients dynamically based on the searched city's conditions (Clear, Clouds, Rain, Snow, Night).
- **Unit Toggler**: Instant toggling between Metric (°C, km/h, km, hPa) and Imperial (°F, mph, miles, inHg) units across all metrics.
- **Hourly Tracker**: A 24-hour horizontal forecast tracker starting from the location's current hour ("Now") and progressing forward.
- **3-Day Outlook**: Daily forecast summaries indicating temperatures, condition descriptions, and rain/snow chance indicators.
- **Detailed Meteorological Grid**:
  - UV Index (with exposure category)
  - Air Quality Index (US EPA index category, PM2.5, and PM10 concentrations)
  - Feels Like temperature
  - Humidity
  - Wind speed and direction
  - Visibility
  - Sunrise & Sunset times
  - Barometric Pressure
- **Quick Access Panel**: Persistent recent searches and pinned favorites saved to `localStorage` for one-click access.
- **Geolocation Integration**: "Locate" button to query weather for your local coordinate inputs automatically.
- **Weather Alerts**: Active warning banners that pulse and notify you of severe weather alerts.

---

## Tech Stack

- **Frontend**: React, Vite
- **Backend API**: Vercel Serverless Functions
- **Local Dev Server**: Built-in Node.js HTTP dev wrapper (for offline/Vercel-free running)
- **API Data Source**: [WeatherAPI.com](https://www.weatherapi.com/)

---

## Project Structure

```
Weather-Application/
├── api/
│   └── weather.js       # Vercel Serverless function (forecast, AQI, alerts)
├── src/
│   ├── App.jsx          # React dashboard code
│   ├── main.jsx         # React application entrypoint
│   └── styles.css       # Premium custom styling design system
├── index.html           # Document HTML, loaded fonts, and SEO metadata
├── dev-server.js        # Offline mock server to run Vercel handlers locally
├── vite.config.js       # Vite bundler config (with API proxying rules)
├── vercel.json          # Deployment configurations
└── package.json         # NPM scripts and dependencies
```

---

## Setup & Local Running

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- A free API key from [WeatherAPI.com](https://www.weatherapi.com/signup.aspx)

### 1. Clone & Install Dependencies

```bash
git clone <repository-url>
cd Weather-Application
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
WEATHER_API_KEY=your_weatherapi_key_here

# Required for local Windows dev if Node has trouble verifying SSL certs
ALLOW_INSECURE_SSL=true
```

### 3. Run Locally

Skyflow contains a custom local development server that hosts the backend API offline on port `3001` and proxies it through Vite on port `3000`. This allows you to run the serverless function without requiring a Vercel login token.

Start both the backend mock server and the client in separate terminal shells:

**Terminal 1 (Mock API Server)**:
```bash
npm run dev:api
```

**Terminal 2 (Vite Frontend)**:
```bash
npm run dev
```

Open [http://localhost:3000/](http://localhost:3000/) in your browser.

---

## Deployment to Vercel

### Option 1: Vercel Git Integration (Recommended)
1. Push your repository to GitHub.
2. Link the repository in the Vercel Dashboard.
3. Configure the environment variable `WEATHER_API_KEY` in the Vercel project settings.
4. Deploy. Vercel automatically detects Vite and builds the client, while mapping `api/weather.js` to a serverless function endpoint.

### Option 2: Vercel CLI
Deploy directly from your CLI terminal:
```bash
npx vercel --prod
```
