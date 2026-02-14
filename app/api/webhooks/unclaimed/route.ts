import { NextResponse } from 'next/server'
import { db } from '@/lib/db/index'
import { webhooks } from '@/lib/db/schema'
import { getAnonymousSessionId } from '@/lib/session'
import { eq, and, isNull } from 'drizzle-orm'

export async function GET() {
  const anonSessionId = await getAnonymousSessionId()
  if (!anonSessionId) {
    return NextResponse.json({ webhook: null })
  }

  const result = await db.select().from(webhooks).where(
    and(eq(webhooks.sessionId, anonSessionId), isNull(webhooks.ownerId), isNull(webhooks.deletedAt))
  ).limit(1)

  return NextResponse.json({ webhook: result[0] || null })
}
