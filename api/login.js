module.exports = function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const password = (req.body && req.body.password) || '';
  const expected = process.env.CASE_STUDIES_PASSWORD;

  if (!expected) {
    return res.status(500).end('Server not configured');
  }

  if (password === expected) {
    res.setHeader('Set-Cookie', `caseStudiesAuth=1; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
    return res.status(200).end('OK');
  }

  return res.status(401).end('Unauthorized');
};
