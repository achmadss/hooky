import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { db } from '@/lib/db/index'
import { webhooks } from '@/lib/db/schema'
import { requireAuth } from '@/lib/api-auth'
import { getAnonymousSessionId } from '@/lib/session'
import { eq, and, isNull } from 'drizzle-orm'

export async function POST(_request: NextRequest) {
  const { error, userId } = await requireAuth()
  if (error) return error

  const anonSessionId = await getAnonymousSessionId()
  if (!anonSessionId) {
    return NextResponse.json({ error: 'No anonymous session found' }, { status: 400 })
  }

  const result = await db.select().from(webhooks).where(
    and(eq(webhooks.sessionId, anonSessionId), isNull(webhooks.ownerId), isNull(webhooks.deletedAt))
  ).limit(1)
  const webhook = result[0]

  if (!webhook) {
    return NextResponse.json({ error: 'No unclaimed webhook found for this session' }, { status: 404 })
  }

  const updated = await db.update(webhooks).set({ ownerId: userId, sessionId: null }).where(eq(webhooks.id, webhook.id)).returning()

  return NextResponse.json(updated[0])
}
