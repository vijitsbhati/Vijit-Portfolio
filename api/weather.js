const https = require('https');

module.exports = function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  const station = 's00006646';
  const url = `https://dd.weather.gc.ca/citypage_weather/json/${station}_e.json`;

  https.get(url, (apiRes) => {
    let data = '';

    apiRes.on('data', (chunk) => {
      data += chunk;
    });

    apiRes.on('end', () => {
      try {
        const jsonData = JSON.parse(data);

        // Set CORS headers to allow requests from your domain
        res.setHeader('Access-Control-Allow-Origin', 'https://www.vijitbhati.com');
        res.setHeader('Access-Control-Allow-Methods', 'GET');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.setHeader('Content-Type', 'application/json');

        res.status(200).json(jsonData);
      } catch (error) {
        console.error('JSON parse error:', error);
        res.status(500).json({ error: 'Failed to parse weather data' });
      }
    });
  }).on('error', (error) => {
    console.error('Weather API error:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  });
};