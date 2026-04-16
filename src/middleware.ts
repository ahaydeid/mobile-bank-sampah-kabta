import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware to protect routes and handle role-based redirection
const protectedRoutes = [
  '/dashboard',
  '/cart',
  '/redeem',
  '/pos',
  '/profile',
  '/history',
  '/qr',
  '/petugas',
];

const publicRoutes = ['/login', '/onboarding'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('role')?.value?.toLowerCase().trim();
  const { pathname } = request.nextUrl;

  // 1. Redirect unauthenticated users from protected routes
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  if (isProtectedRoute && !token) {
    const url = new URL('/login', request.url);
    // Optional: save attempted URL to redirect back after login
    // url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // 2. Redirect authenticated users away from public routes
  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );
  if (isPublicRoute && token) {
    if (role === 'member' || role === 'nasabah') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } else if (role === 'petugas' || role === 'admin') {
      return NextResponse.redirect(new URL('/petugas/dashboard', request.url));
    }
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 3. Role-based protection
  // Prevent Nasabah/Member from accessing /petugas paths
  const isNasabah = role === 'member' || role === 'nasabah';
  const isStaff = role === 'petugas' || role === 'admin';

  if (pathname.startsWith('/petugas') && isNasabah) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  if (pathname.startsWith('/dashboard') && isStaff) {
     return NextResponse.redirect(new URL('/petugas/dashboard', request.url));
  }

  return NextResponse.next();
}

// Routes to match for middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - icons (PWA icons)
     * - manifest.json (PWA manifest)
     * - sw.js (Service worker)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)',
  ],
};
