import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { getAnonymousSessionId } from '@/lib/session'
import { db } from '@/lib/db/index'
import { webhooks } from '@/lib/db/schema'
import { eq, and, isNull } from 'drizzle-orm'

export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), userId: null }
  }
  return { error: null, userId: session.user.id }
}

export async function requireWebhookOwnership(webhookId: string) {
  const session = await getServerSession(authOptions)

  if (session?.user?.id) {
    const result = await db.select().from(webhooks).where(
      and(eq(webhooks.id, webhookId), eq(webhooks.ownerId, session.user.id), isNull(webhooks.deletedAt))
    ).limit(1)
    const webhook = result[0]
    if (!webhook) {
      return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }), webhook: null }
    }
    return { error: null, webhook }
  }

  const anonSessionId = await getAnonymousSessionId()
  if (!anonSessionId) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }), webhook: null }
  }
  const result = await db.select().from(webhooks).where(
    and(eq(webhooks.id, webhookId), eq(webhooks.sessionId, anonSessionId), isNull(webhooks.ownerId), isNull(webhooks.deletedAt))
  ).limit(1)
  const webhook = result[0]
  if (!webhook) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }), webhook: null }
  }
  return { error: null, webhook }
}
