import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { generateSessionId, anonCookieOptions, ANON_SESSION_COOKIE } from '@/lib/session'
import { generateToken } from '@/lib/token'
import { db } from '@/lib/db/index'
import { webhooks } from '@/lib/db/schema'
import { eq, and, isNull } from 'drizzle-orm'

export async function GET() {
  const cookieStore = await cookies()

  let sessionId = cookieStore.get(ANON_SESSION_COOKIE)?.value
  if (sessionId) {
    const existing = await db.select().from(webhooks).where(
      and(eq(webhooks.sessionId, sessionId), isNull(webhooks.ownerId), isNull(webhooks.deletedAt))
    ).limit(1)
    if (existing[0]) {
      return NextResponse.redirect(
        new URL(`/webhooks/${existing[0].id}`, process.env.NEXTAUTH_URL ?? 'http://localhost:3000')
      )
    }
  }

  sessionId = generateSessionId()

  let token = generateToken()
  let existing = await db.select().from(webhooks).where(eq(webhooks.token, token)).limit(1)
  while (existing[0]) {
    token = generateToken()
    existing = await db.select().from(webhooks).where(eq(webhooks.token, token)).limit(1)
  }

  const result = await db.insert(webhooks).values({ token, sessionId }).returning()
  const webhook = result[0]

  const response = NextResponse.redirect(
    new URL(`/webhooks/${webhook.id}`, process.env.NEXTAUTH_URL ?? 'http://localhost:3000')
  )
  response.cookies.set(ANON_SESSION_COOKIE, sessionId, anonCookieOptions())
  return response
}
