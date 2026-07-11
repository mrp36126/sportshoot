import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default auth(async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Auth paths that should redirect authenticated users away
  const authPaths = ['/login', '/register', '/forgot-password'];

  // Protected paths that require authentication
  const protectedPaths = ['/dashboard', '/sessions', '/firearms', '/admin', '/progress', '/statistics'];

  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));

  const isAuthenticated = !!req.auth?.user;

  // Redirect to login if not authenticated on protected paths
  if (isProtectedPath && !isAuthenticated) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Admin routes
  if (pathname.startsWith('/admin') && isAuthenticated && req.auth?.user) {
    try {
      const { getUserById } = await import('@/lib/turso/queries');
      const user = await getUserById(req.auth.user.id as string);
      if (user?.role !== 'admin') {
        const url = req.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
      }
    } catch {
      const url = req.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPath && isAuthenticated) {
    const url = req.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};