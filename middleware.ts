import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes that don't require authentication
  const publicRoutes = [
    '/login', 
    '/register', 
    '/forgot-password', 
    '/contact'
  ];
  
  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`));
  
  // Get authentication status from cookies
  // Note: In Next.js middleware, we can't access localStorage directly
  // We check for accessToken and refreshToken cookies set by the backend
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;
  const isAuthenticated = !!(accessToken || refreshToken);
  
  // If user is not authenticated and trying to access protected route
  if (!isPublicRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    // Add the original URL as a redirect parameter so we can send them back after login
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // If user is authenticated and trying to access login/register, redirect to home
  if (isPublicRoute && isAuthenticated && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/clinic/bodyblissphysio', request.url));
  }

  // Redirect root path to active clinic (BodyBliss Physio) if authenticated
  if (pathname === '/') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/clinic/bodyblissphysio', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Handle /clinics routes (these should not be redirected)
  if (pathname === '/clinics' || pathname.startsWith('/clinics/')) {
    return NextResponse.next();
  }

  // Redirect old routes to clinic-specific routes if they don't start with /clinic
  const clinicRoutes = ['/clients', '/orders', '/payments', '/reports'];
  
  for (const route of clinicRoutes) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      return NextResponse.redirect(new URL(`/clinic/bodyblissphysio${pathname}`, request.url));
    }
  }

  // Handle settings routes
  if (pathname === '/settings' || pathname.startsWith('/settings/')) {
    // Check if this is a clinic-specific settings request or global settings
    // For now, we'll keep the global settings routes as they are
    // In a real implementation, we might check user context here
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public|r/).*)',
  ],
}; 