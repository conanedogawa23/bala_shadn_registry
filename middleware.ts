import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Global routes that should not be redirected
  const globalRoutes = [
    '/login', 
    '/register', 
    '/forgot-password', 
    '/contact',
    '/activity',
    '/notifications',
    '/profile'
  ];
  
  // Check if the current path is a global route
  if (globalRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`))) {
    return NextResponse.next();
  }

  // Redirect root path to active clinic (BodyBliss Physio)
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/clinic/bodybliss-physio', request.url));
  }

  // Handle /clinics routes (these should not be redirected)
  if (pathname === '/clinics' || pathname.startsWith('/clinics/')) {
    return NextResponse.next();
  }

  // Redirect old routes to clinic-specific routes if they don't start with /clinic
  const clinicRoutes = ['/clients', '/orders', '/payments', '/reports'];
  
  for (const route of clinicRoutes) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      return NextResponse.redirect(new URL(`/clinic/bodybliss-physio${pathname}`, request.url));
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