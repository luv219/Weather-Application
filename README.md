# Weather Application

A full-stack weather app that lets you search for current weather by city. Built with React and Vite, with a serverless API powered by [WeatherAPI.com](https://www.weatherapi.com/). Deployed on [Vercel](https://vercel.com/).

## Tech Stack

- **Frontend:** React, Vite
- **Backend:** Vercel Serverless Functions
- **API:** [WeatherAPI.com](https://www.weatherapi.com/)
- **Hosting:** Vercel

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- A free API key from [WeatherAPI.com](https://www.weatherapi.com/signup.aspx)

## Project Structure

```
Weather-Application/
├── api/
│   └── weather.js       # Serverless API route
├── src/
│   ├── App.jsx          # React app
│   ├── main.jsx
│   └── styles.css
├── index.html
├── package.json
├── vite.config.js
└── vercel.json
```

## Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Weather-Application
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy the example env file and add your API key:

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local`:

   ```env
   WEATHER_API_KEY=your_weatherapi_key_here
   ALLOW_INSECURE_SSL=false
   ```

   > Keep your real API key in `.env.local` only. Do not commit it to git.

## Running Locally

Use Vercel's dev server to run both the frontend and API together:

```bash
npm run dev
```

Open the URL shown in the terminal (usually **http://localhost:3000**).

To run only the Vite frontend (API calls will not work):

```bash
npm run dev:client
```

## Deploy to Vercel

1. Push your code to GitHub.
2. Import the repository at [vercel.com/new](https://vercel.com/new).
3. Add environment variables in the Vercel project settings:
   - `WEATHER_API_KEY` — your WeatherAPI.com key
4. Deploy.

Vercel will auto-detect the Vite framework and deploy `api/weather.js` as a serverless function.

Alternatively, deploy from the CLI:

```bash
npx vercel
```

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

**SSL errors when running locally on Windows**

Set this in `.env.local`:

```env
ALLOW_INSECURE_SSL=true
```

Use this for local development only. Vercel production does not need this.

**API returns "Weather API key is not configured" on Vercel**

Add `WEATHER_API_KEY` in your Vercel project → Settings → Environment Variables, then redeploy.
