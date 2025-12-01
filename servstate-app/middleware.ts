import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth.config';

// Use the Edge-compatible auth config for middleware
// The full auth with providers is only used in API routes
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ['/borrower/:path*', '/servicer/:path*', '/login'],
};

