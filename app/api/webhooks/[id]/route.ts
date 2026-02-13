import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { requireAuth, requireWebhookOwnership } from '@/lib/api-auth'

type Params = { params: Promise<{ id: string }> }

// Task 3.6: GET /api/webhooks/[id] — ownership/session check
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const { error, webhook } = await requireWebhookOwnership(id)
  if (error) return error

  const full = await prisma.webhook.findUnique({
    where: { id: webhook!.id },
    include: { _count: { select: { requests: true } }, responseConfig: true },
  })
  return NextResponse.json(full)
}

// Task 3.7: PATCH /api/webhooks/[id] — update name/isEnabled (authenticated only)
export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params
  const { error: authError, userId } = await requireAuth()
  if (authError) return authError

  const webhook = await prisma.webhook.findFirst({ where: { id, ownerId: userId } })
  if (!webhook) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json().catch(() => ({}))
  const { name, isEnabled } = body as { name?: string; isEnabled?: boolean }

  const updated = await prisma.webhook.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(isEnabled !== undefined && { isEnabled }),
    },
  })
  return NextResponse.json(updated)
}

// Task 3.8: DELETE /api/webhooks/[id] — soft-delete webhook and its requests (authenticated only)
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const { error: authError, userId } = await requireAuth()
  if (authError) return authError

  const webhook = await prisma.webhook.findFirst({ where: { id, ownerId: userId } })
  if (!webhook) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  // Soft-delete requests first, then the webhook
  await prisma.request.deleteMany({ where: { webhookId: id } })
  await prisma.webhook.delete({ where: { id } })

  return new NextResponse(null, { status: 204 })
}
