import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { generateSessionId, anonCookieOptions, ANON_SESSION_COOKIE } from '@/lib/session'
import { generateToken } from '@/lib/token'
import prisma from '@/lib/db'

// Anonymous session initialization: set cookie, create webhook, redirect to it.
// Called from the homepage when no anonymous session cookie exists yet.
// Cookies can only be set in Route Handlers, not Server Components.
export async function GET() {
  const cookieStore = await cookies()

  // Reuse existing session if cookie somehow arrived
  let sessionId = cookieStore.get(ANON_SESSION_COOKIE)?.value
  if (sessionId) {
    const existing = await prisma.webhook.findFirst({
      where: { sessionId, ownerId: null },
    })
    if (existing) {
      return NextResponse.redirect(
        new URL(`/webhooks/${existing.id}`, process.env.NEXTAUTH_URL ?? 'http://localhost:3000')
      )
    }
  }

  // New session
  sessionId = generateSessionId()

  let token = generateToken()
  while (await prisma.webhook.findUnique({ where: { token } })) {
    token = generateToken()
  }

  const webhook = await prisma.webhook.create({
    data: { token, sessionId },
  })

  const response = NextResponse.redirect(
    new URL(`/webhooks/${webhook.id}`, process.env.NEXTAUTH_URL ?? 'http://localhost:3000')
  )
  response.cookies.set(ANON_SESSION_COOKIE, sessionId, anonCookieOptions())
  return response
}
