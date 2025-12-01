import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { sql } from './db';
import type { User, UserRole } from '@/types';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Query the users table
          const users = await sql`
            SELECT id, email, name, role, avatar, password_hash 
            FROM users 
            WHERE email = ${credentials.email as string}
          `;

          if (users.length === 0) {
            return null;
          }

          const user = users[0];

          // Verify password
          const isValidPassword = await bcrypt.compare(
            credentials.password as string,
            user.password_hash
          );

          if (!isValidPassword) {
            return null;
          }

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
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.avatar = user.avatar;
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
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
});

