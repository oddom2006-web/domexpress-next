// middleware.ts  (Next.js App Router — runs on Edge)
// Protects /admin, /customer, /driver routes — redirects to /auth if no session
import { NextRequest, NextResponse } from 'next/server';

const PROTECTED = ['/admin', '/customer', '/driver', '/employee'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route needs protection
  const isProtected = PROTECTED.some(p => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  // We store user in sessionStorage (client-only), so we can't read it on Edge.
  // Instead we rely on a lightweight cookie set by AuthContext after login.
  const userCookie = request.cookies.get('dom_role')?.value;

  if (!userCookie) {
    // Not logged in → redirect to auth
    const url = request.nextUrl.clone();
    url.pathname = '/auth';
    return NextResponse.redirect(url);
  }

  // Role-based protection
  if (pathname.startsWith('/admin')    && userCookie !== 'admin')    return NextResponse.redirect(new URL('/auth', request.url));
  if (pathname.startsWith('/driver')   && userCookie !== 'driver')   return NextResponse.redirect(new URL('/auth', request.url));
  if (pathname.startsWith('/customer') && userCookie !== 'customer') return NextResponse.redirect(new URL('/auth', request.url));
  if (pathname.startsWith('/employee') && userCookie !== 'employee') return NextResponse.redirect(new URL('/auth', request.url));

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/customer/:path*', '/driver/:path*', '/employee/:path*'],
};