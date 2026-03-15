import { NextResponse } from 'next/server';

const PROTECTED_PATH = '/case-studies.html';
const COOKIE_NAME = 'caseStudiesAuth';

export function middleware(req) {
  const url = req.nextUrl.clone();

  if (!url.pathname.startsWith(PROTECTED_PATH)) {
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
  matcher: [PROTECTED_PATH],
};
