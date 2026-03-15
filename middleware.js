import { NextResponse } from 'next/server';

const COOKIE_NAME = 'caseStudiesAuth';

export function middleware(req) {
  const url = req.nextUrl.clone();

  if (!url.pathname.startsWith('/case-studies.html')) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (token === '1') {
    return NextResponse.next();
  }

  url.pathname = '/login.html';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/case-studies.html'],
};
