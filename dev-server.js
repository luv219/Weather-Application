import http from 'http';
import url from 'url';
import handler from './api/weather.js';
import fs from 'fs';

// Parse .env.local manually to set process.env locally
try {
  if (fs.existsSync('.env.local')) {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    envContent.split('\n').forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine && !trimmedLine.startsWith('#')) {
        const parts = trimmedLine.split('=');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const val = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
          process.env[key] = val;
        }
      }
    });
    console.log('Loaded env variables from .env.local');
  } else {
    console.log('Warning: .env.local file not found.');
  }
} catch (e) {
  console.log('Error reading .env.local:', e.message);
}

const server = http.createServer(async (req, res) => {
  // CORS Headers for local development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);

  if (parsedUrl.pathname === '/api/weather' && req.method === 'GET') {
    // Mock Vercel's request and response objects
    const mockReq = {
      method: req.method,
      query: parsedUrl.query,
    };

    const mockRes = {
      status(statusCode) {
        res.statusCode = statusCode;
        return this;
      },
      json(data) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
        return this;
      }
    };

    try {
      await handler(mockReq, mockRes);
    } catch (err) {
      console.error('API Handler Error:', err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Internal Server Error in dev server' }));
    }
  } else {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Not Found');
  }
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Local mock API server running on http://localhost:${PORT}`);
});
