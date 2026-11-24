const COOKIE_NAME = 'caseStudiesAuth';

function getCookie(cookies, name) {
  const match = cookies.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, '0')).join('');
}

// Token format matches api/login.js: "<expiry unix seconds>.<hex HMAC-SHA256 of expiry>".
async function isValidToken(token) {
  const secret = String(process.env.CASE_STUDIES_SECRET || process.env.CASE_STUDIES_PASSWORD || '').trim();
  if (!secret || !token) return false;

  const [exp, sig] = token.split('.');
  if (!/^\d+$/.test(exp || '') || !/^[0-9a-f]{64}$/.test(sig || '')) return false;
  if (Number(exp) < Math.floor(Date.now() / 1000)) return false;

  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const expected = toHex(await crypto.subtle.sign('HMAC', key, enc.encode(exp)));

  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0;
}

export const config = {
  matcher: ['/case-studies.html', '/img/datacafe/:path*'],
};

export default async function middleware(request) {
  const url = new URL(request.url);
  const isProtected = url.pathname.startsWith('/case-studies.html') || url.pathname.startsWith('/img/datacafe/');
  if (!isProtected) {
    return fetch(request);
  }

  const token = getCookie(request.headers.get('cookie') || '', COOKIE_NAME);
  if (await isValidToken(token)) {
    return fetch(request);
  }

  if (url.pathname.startsWith('/img/')) {
    return new Response('Unauthorized', { status: 401 });
  }
  const loginUrl = new URL('/login.html', request.url);
  return Response.redirect(loginUrl, 302);
}
