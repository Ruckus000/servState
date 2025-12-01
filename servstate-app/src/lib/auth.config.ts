import type { NextAuthConfig } from 'next-auth';
import type { UserRole } from '@/types';

/**
 * NextAuth configuration that is Edge-compatible.
 * This is used by middleware and doesn't include Node.js-specific providers.
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: UserRole }).role;
        token.avatar = (user as { avatar?: string }).avatar;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.avatar = token.avatar as string | undefined;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;

      const isBorrowerRoute = pathname.startsWith('/borrower');
      const isServicerRoute = pathname.startsWith('/servicer');
      const isProtectedRoute = isBorrowerRoute || isServicerRoute;

      if (isProtectedRoute) {
        if (!isLoggedIn) return false; // Redirect to login

        const userRole = auth?.user?.role;

        // Borrowers can only access borrower routes
        if (isBorrowerRoute && userRole !== 'borrower') {
          return Response.redirect(new URL('/servicer', nextUrl));
        }

        // Only servicers and admins can access servicer routes
        if (isServicerRoute && userRole === 'borrower') {
          return Response.redirect(new URL('/borrower', nextUrl));
        }

        return true;
      }

      // Redirect authenticated users from login to their dashboard
      if (pathname === '/login' && isLoggedIn) {
        const dashboardUrl = auth?.user?.role === 'borrower' ? '/borrower' : '/servicer';
        return Response.redirect(new URL(dashboardUrl, nextUrl));
      }

      return true;
    },
  },
  providers: [], // Providers are added in auth.ts
  session: {
    strategy: 'jwt',
  },
};
