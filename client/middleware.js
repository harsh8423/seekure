import { NextResponse } from 'next/server';

export function middleware(request) {
  // Read the token from cookies
  const token = request.cookies.get('token');
  const isAuthPage = request.nextUrl.pathname.startsWith('/login');
  console.log(isAuthPage)
  // If user is authenticated and tries to access login page
  // redirect them to home page
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // If user is not authenticated and tries to access protected routes
  // redirect them to login page
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Allow the request to proceed normally
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/home/:id*',  // Match dynamic home routes
    '/home',
    '/login',
    '/review',
    '/resume/:id*'  // Match dynamic resume routes
  ],
};