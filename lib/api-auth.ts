import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { getAnonymousSessionId } from '@/lib/session'
import prisma from '@/lib/db'

// Task 3.11: Require authenticated session; return 401 if missing
export async function requireAuth() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), userId: null }
  }
  return { error: null, userId: session.user.id }
}

// Task 3.12: Validate webhook ownership for the current user or anonymous session
export async function requireWebhookOwnership(webhookId: string) {
  const session = await getServerSession(authOptions)

  if (session?.user?.id) {
    const webhook = await prisma.webhook.findFirst({
      where: { id: webhookId, ownerId: session.user.id },
    })
    if (!webhook) {
      return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }), webhook: null }
    }
    return { error: null, webhook }
  }

  // Anonymous: check session cookie
  const anonSessionId = await getAnonymousSessionId()
  if (!anonSessionId) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }), webhook: null }
  }
  const webhook = await prisma.webhook.findFirst({
    where: { id: webhookId, sessionId: anonSessionId, ownerId: null },
  })
  if (!webhook) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }), webhook: null }
  }
  return { error: null, webhook }
}
