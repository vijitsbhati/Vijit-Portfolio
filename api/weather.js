module.exports = async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const station = 's00006646';
    const url = `https://dd.weather.gc.ca/citypage_weather/json/${station}_e.json`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather API responded with ${response.status}`);
    }

    const data = await response.json();

    // Set CORS headers to allow requests from your domain
    res.setHeader('Access-Control-Allow-Origin', 'https://www.vijitbhati.com');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    res.status(200).json(data);
  } catch (error) {
    console.error('Weather proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
};