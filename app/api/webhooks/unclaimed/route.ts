import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getAnonymousSessionId } from '@/lib/session'

// Task 3.9: GET /api/webhooks/unclaimed — get unclaimed webhook for the current anonymous session
export async function GET() {
  const anonSessionId = await getAnonymousSessionId()
  if (!anonSessionId) {
    return NextResponse.json({ webhook: null })
  }

  const webhook = await prisma.webhook.findFirst({
    where: { sessionId: anonSessionId, ownerId: null },
  })

  return NextResponse.json({ webhook })
}
