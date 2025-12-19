import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { sql } from './db';
import type { UserRole } from '@/types';
import type { UserRow } from '@/types/db';
import { authConfig } from './auth.config';
import { checkAuthRateLimit, getClientIp } from './rate-limit';
import { logAudit } from './audit';
import type { AuditActionType } from '@/types/audit-log';

/**
 * Log authentication events to the audit log
 */
async function logAuthEvent(
  eventType: 'login_success' | 'login_failed' | 'logout',
  userId: string | null,
  email: string,
  ip: string,
  details?: Record<string, unknown>
) {
  try {
    await logAudit({
      loanId: null,
      actionType: eventType as AuditActionType,
      // category auto-derived as 'security'
      description: `${eventType.replace(/_/g, ' ')} for ${email}`,
      performedBy: userId || 'anonymous',
      ipAddress: ip,
      details: { email, ...details },
    });
  } catch (error) {
    // Don't fail auth if audit logging fails
    console.error('Failed to log auth event:', error);
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, request) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Get IP for rate limiting and logging
        const ip = request?.headers
          ? getClientIp(new Headers(request.headers as HeadersInit))
          : 'unknown';
        const email = credentials.email as string;

        try {
          // Rate limit authentication attempts by IP
          const { success, reset } = await checkAuthRateLimit(ip);

          if (!success) {
            const retryAfter = Math.ceil((reset - Date.now()) / 1000);
            console.warn(`Rate limit exceeded for IP: ${ip}. Retry after ${retryAfter}s`);
            await logAuthEvent('login_failed', null, email, ip, {
              reason: 'rate_limit_exceeded',
            });
            throw new Error(`Too many login attempts. Please try again in ${retryAfter} seconds.`);
          }

          // Query the users table
          const users = await sql<UserRow>`
            SELECT id, email, name, role, avatar, password_hash
            FROM users
            WHERE email = ${email}
          `;

          if (users.length === 0) {
            await logAuthEvent('login_failed', null, email, ip, {
              reason: 'user_not_found',
            });
            return null;
          }

          const user = users[0];

          // Check if user has a password hash
          if (!user.password_hash) {
            await logAuthEvent('login_failed', user.id, email, ip, {
              reason: 'no_password_set',
            });
            return null;
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(
            credentials.password as string,
            user.password_hash
          );

          if (!isValidPassword) {
            await logAuthEvent('login_failed', user.id, email, ip, {
              reason: 'invalid_password',
            });
            return null;
          }

          // Log successful login
          await logAuthEvent('login_success', user.id, email, ip);

          // Return user object (without password_hash)
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role as UserRole,
            avatar: user.avatar || undefined,
          };
        } catch (error) {
          console.error('Auth error:', error);
          // Re-throw rate limit errors to show the message to the user
          if (error instanceof Error && error.message.includes('Too many login attempts')) {
            throw error;
          }
          return null;
        }
      },
    }),
  ],
  events: {
    async signOut(message) {
      // Log signout event
      if ('token' in message && message.token?.email) {
        const email = message.token.email as string;
        const userId = message.token.id as string;
        await logAuthEvent('logout', userId, email, 'unknown');
      }
    },
  },
});













