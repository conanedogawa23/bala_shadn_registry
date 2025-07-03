import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect root path to active clinic (BodyBliss Physio)
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/clinic/bodybliss-physio', request.url));
  }

  // Redirect old routes to clinic-specific routes if they don't start with /clinic
  const clinicRoutes = ['/clients', '/orders', '/payments', '/reports', '/settings'];
  
  for (const route of clinicRoutes) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      return NextResponse.redirect(new URL(`/clinic/bodybliss-physio${pathname}`, request.url));
    }
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