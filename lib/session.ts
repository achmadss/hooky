import { cookies } from 'next/headers'
import { randomBytes } from 'crypto'

export const ANON_SESSION_COOKIE = 'hooky_anon_session'

// Task 8.7 / 8.3: Session expiry in days (configurable via env)
const SESSION_EXPIRY_DAYS = parseInt(
  process.env.ANONYMOUS_SESSION_EXPIRY_DAYS ?? '6',
  10
)

// Task 2.3 / 2.8: Generate a new anonymous session ID
export function generateSessionId(): string {
  return randomBytes(16).toString('hex')
}

// Task 2.8 / 2.10: Get the anonymous session ID from the cookie (server-side)
export async function getAnonymousSessionId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(ANON_SESSION_COOKIE)?.value ?? null
}

// Task 2.4: Build cookie options (HTTP-only, Secure in production, SameSite=Lax)
export function anonCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60,
    path: '/',
  }
}
