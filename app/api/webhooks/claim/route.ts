import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'
import { getAnonymousSessionId } from '@/lib/session'

// Task 3.10: POST /api/webhooks/claim — transfer anonymous webhook to authenticated user
export async function POST(_request: NextRequest) {
  const { error, userId } = await requireAuth()
  if (error) return error

  const anonSessionId = await getAnonymousSessionId()
  if (!anonSessionId) {
    return NextResponse.json({ error: 'No anonymous session found' }, { status: 400 })
  }

  const webhook = await prisma.webhook.findFirst({
    where: { sessionId: anonSessionId, ownerId: null },
  })
  if (!webhook) {
    return NextResponse.json({ error: 'No unclaimed webhook found for this session' }, { status: 404 })
  }

  const claimed = await prisma.webhook.update({
    where: { id: webhook.id },
    data: { ownerId: userId, sessionId: null },
  })

  return NextResponse.json(claimed)
}
