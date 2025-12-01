import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const session = req.auth;
  const { pathname } = req.nextUrl;

  // Protected routes
  const isBorrowerRoute = pathname.startsWith('/borrower');
  const isServicerRoute = pathname.startsWith('/servicer');
  const isProtectedRoute = isBorrowerRoute || isServicerRoute;

  // If trying to access protected route without authentication
  if (isProtectedRoute && !session) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access control
  if (session && isProtectedRoute) {
    const userRole = session.user.role;

    // Borrowers can only access borrower routes
    if (isBorrowerRoute && userRole !== 'borrower') {
      return NextResponse.redirect(new URL('/servicer', req.url));
    }

    // Only servicers and admins can access servicer routes
    if (isServicerRoute && userRole === 'borrower') {
      return NextResponse.redirect(new URL('/borrower', req.url));
    }
  }

  // Redirect authenticated users from login to their dashboard
  if (pathname === '/login' && session) {
    const dashboardUrl = session.user.role === 'borrower' ? '/borrower' : '/servicer';
    return NextResponse.redirect(new URL(dashboardUrl, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/borrower/:path*', '/servicer/:path*', '/login'],
};

