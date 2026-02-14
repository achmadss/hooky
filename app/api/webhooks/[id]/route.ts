import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { db } from '@/lib/db/index'
import { webhooks, requests, responseConfigs } from '@/lib/db/schema'
import { requireAuth, requireWebhookOwnership } from '@/lib/api-auth'
import { eq, and, isNull, sql } from 'drizzle-orm'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const { error, webhook: wh } = await requireWebhookOwnership(id)
  if (error) return error

  const webhookResult = await db.select().from(webhooks).where(
    and(eq(webhooks.id, wh!.id), isNull(webhooks.deletedAt))
  ).limit(1)
  const webhook = webhookResult[0]

  const reqCount = await db.select({ count: sql<number>`count(*)` }).from(requests).where(
    and(eq(requests.webhookId, webhook.id), isNull(requests.deletedAt))
  )

  const configResult = await db.select().from(responseConfigs).where(
    and(eq(responseConfigs.webhookId, webhook.id), isNull(responseConfigs.deletedAt))
  ).limit(1)

  const full = {
    ...webhook,
    _count: { requests: reqCount[0]?.count || 0 },
    responseConfig: configResult[0] || null,
  }
  return NextResponse.json(full)
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params
  const { error: authError, userId } = await requireAuth()
  if (authError) return authError

  const webhookResult = await db.select().from(webhooks).where(
    and(eq(webhooks.id, id), eq(webhooks.ownerId, userId), isNull(webhooks.deletedAt))
  ).limit(1)
  const webhook = webhookResult[0]
  if (!webhook) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json().catch(() => ({}))
  const { name, isEnabled, token, visibility } = body as { name?: string; isEnabled?: boolean; token?: string; visibility?: string }

  if (token !== undefined && token !== webhook.token) {
    const existing = await db.select().from(webhooks).where(eq(webhooks.token, token)).limit(1)
    if (existing[0]) {
      return NextResponse.json({ error: 'Token already in use' }, { status: 409 })
    }
  }

  const updateData: Record<string, unknown> = {}
  if (name !== undefined) updateData.name = name
  if (isEnabled !== undefined) updateData.isEnabled = isEnabled
  if (token !== undefined) updateData.token = token
  if (visibility !== undefined) updateData.visibility = visibility === 'public' ? 'public' : 'private'

  const result = await db.update(webhooks).set(updateData).where(eq(webhooks.id, id)).returning()
  return NextResponse.json(result[0])
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const { error: authError, userId } = await requireAuth()
  if (authError) return authError

  const webhookResult = await db.select().from(webhooks).where(
    and(eq(webhooks.id, id), eq(webhooks.ownerId, userId), isNull(webhooks.deletedAt))
  ).limit(1)
  const webhook = webhookResult[0]
  if (!webhook) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await db.update(requests).set({ deletedAt: new Date() }).where(
    and(eq(requests.webhookId, id), isNull(requests.deletedAt))
  )
  await db.update(webhooks).set({ deletedAt: new Date() }).where(eq(webhooks.id, id))

  return new NextResponse(null, { status: 204 })
}
