import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/db'

export const authOptions: NextAuthOptions = {
  // Task 2.12: Support multiple providers for future OAuth extensibility
  providers: [
    // Task 2.1: Credentials provider for email/password auth
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        })
        if (!user || !user.passwordHash) return null

        // Task 2.2: Password hashing using bcryptjs
        const valid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!valid) return null

        return { id: user.id, email: user.email }
      },
    }),
    // Task 2.11: Additional OAuth providers can be added here without schema changes
    // e.g. GitHubProvider, GoogleProvider — the User model's `passwordHash` is nullable
    // to support OAuth-only accounts
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: '/',
  },
}

// Task 2.2: Hash a plaintext password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}
