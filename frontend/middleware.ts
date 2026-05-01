/**
 * Next.js Middleware for Route Protection
 * 
 * Handles:
 * - Admin route blocking (separate admin-frontend)
 * - Client-side auth handled by components
 * 
 * Note: Since tokens are stored in localStorage (client-side only),
 * we cannot check authentication in middleware. Protected routes
 * handle their own auth checks and redirects on the client.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require admin role (should not be accessible in this frontend)
const adminRoutes = ['/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if trying to access admin routes
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // Redirect admin routes to main app (admin has separate frontend)
  if (isAdminRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Let all other routes through - auth is handled client-side
  // This is because tokens are in localStorage, not accessible to middleware
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
};
