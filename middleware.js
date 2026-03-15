const COOKIE_NAME = 'caseStudiesAuth';

function getCookie(cookies, name) {
  const match = cookies.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : undefined;
}

export const config = {
  matcher: ['/case-studies.html'],
};

export default async function middleware(request) {
  const url = new URL(request.url);
  if (!url.pathname.startsWith('/case-studies.html')) {
    return fetch(request);
  }

  const cookieHeader = request.headers.get('cookie') || '';
  const token = getCookie(cookieHeader, COOKIE_NAME);
  if (token === '1') {
    return fetch(request);
  }

  const loginUrl = new URL('/login.html', request.url);
  return Response.redirect(loginUrl, 302);
}
