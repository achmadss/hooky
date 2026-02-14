import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db/index'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const result = await db.select().from(users).where(eq(users.email, credentials.email.toLowerCase())).limit(1)
        const user = result[0]
        if (!user || !user.passwordHash) return null

        const valid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!valid) return null

        return { id: user.id, email: user.email }
      },
    }),
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
        const result = await db.select().from(users).where(eq(users.id, token.id as string)).limit(1)
        const user = result[0]
        if (!user) {
          return { ...session, user: undefined }
        }
        session.user.id = token.id as string
      }
      return session
    },
  },
  pages: {
    signIn: '/',
  },
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}
