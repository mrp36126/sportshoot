/**
 * NextAuth v5 Authentication Configuration
 * 
 * Central auth module for SportShoot.
 * Uses Credentials provider with email/password authentication.
 * Compatible with Vercel Edge Runtime.
 */

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        displayName: { label: 'Display Name', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const { getUserByEmail, createUser } = await import('@/lib/turso/queries');
        const { verifyPassword } = await import('@/lib/auth/password-utils');

        const email = (credentials.email as string).toLowerCase().trim();
        const existingUser = await getUserByEmail(email);

        if (existingUser) {
          const isValid = await verifyPassword(
            credentials.password as string,
            existingUser.password_hash
          );
          if (!isValid) return null;

          return {
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.display_name,
            image: existingUser.profile_image_url,
          };
        }

        // Registration flow
        if (credentials.displayName) {
          const newUser = await createUser({
            email,
            displayName: credentials.displayName as string,
            password: credentials.password as string,
          });

          return {
            id: newUser.id,
            email: newUser.email,
            name: newUser.display_name,
          };
        }

        return null;
      },
    }),
  ],
  pages: {
    signIn: '/login',
    newUser: '/register',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
      }
      if (trigger === 'update' && session) {
        token.name = session.user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
});