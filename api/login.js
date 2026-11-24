const crypto = require('crypto');

const MAX_AGE = 86400;

function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(a).digest();
  const hb = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

module.exports = function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const password = String((req.body && req.body.password) || '').trim();
  const expected = String(process.env.CASE_STUDIES_PASSWORD || '').trim();

  if (!expected) {
    return res.status(500).end('Server not configured');
  }

  if (safeEqual(password, expected)) {
    // Signed, expiring token verified by middleware.js; a hand-set cookie can't pass.
    const secret = String(process.env.CASE_STUDIES_SECRET || expected).trim();
    const exp = String(Math.floor(Date.now() / 1000) + MAX_AGE);
    const sig = crypto.createHmac('sha256', secret).update(exp).digest('hex');
    res.setHeader('Set-Cookie', `caseStudiesAuth=${exp}.${sig}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${MAX_AGE}`);
    return res.status(200).end('OK');
  }

  return res.status(401).end('Unauthorized');
};
