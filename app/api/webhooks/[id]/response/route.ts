import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { db } from '@/lib/db/index'
import { responseConfigs } from '@/lib/db/schema'
import { requireWebhookOwnership } from '@/lib/api-auth'
import { eq, and, isNull } from 'drizzle-orm'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const { error } = await requireWebhookOwnership(id)
  if (error) return error

  const result = await db.select().from(responseConfigs).where(
    and(eq(responseConfigs.webhookId, id), isNull(responseConfigs.deletedAt))
  ).limit(1)
  const config = result[0]

  if (!config) {
    return NextResponse.json({ statusCode: 200, headers: {}, body: null, contentType: 'application/json', isDefault: true })
  }
  return NextResponse.json({ ...config, isDefault: false })
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params
  const { error } = await requireWebhookOwnership(id)
  if (error) return error

  const body = await request.json().catch(() => ({}))
  const { statusCode, headers, body: responseBody, contentType } = body as {
    statusCode?: number
    headers?: Record<string, string>
    body?: string
    contentType?: string
  }

  if (statusCode !== undefined && (statusCode < 100 || statusCode > 599)) {
    return NextResponse.json({ error: 'Status code must be between 100 and 599' }, { status: 422 })
  }

  const existing = await db.select().from(responseConfigs).where(
    and(eq(responseConfigs.webhookId, id), isNull(responseConfigs.deletedAt))
  ).limit(1)

  if (existing[0]) {
    const updateData: Record<string, unknown> = {}
    if (statusCode !== undefined) updateData.statusCode = statusCode
    if (headers !== undefined) updateData.headers = headers
    if (responseBody !== undefined) updateData.body = responseBody
    if (contentType !== undefined) updateData.contentType = contentType

    const result = await db.update(responseConfigs).set(updateData).where(eq(responseConfigs.webhookId, id)).returning()
    return NextResponse.json(result[0])
  } else {
    const result = await db.insert(responseConfigs).values({
      webhookId: id,
      statusCode: statusCode ?? 200,
      headers: headers ?? {},
      body: responseBody ?? null,
      contentType: contentType ?? 'application/json',
    }).returning()
    return NextResponse.json(result[0])
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const { error } = await requireWebhookOwnership(id)
  if (error) return error

  await db.update(responseConfigs).set({ deletedAt: new Date() }).where(
    and(eq(responseConfigs.webhookId, id), isNull(responseConfigs.deletedAt))
  )
  return new NextResponse(null, { status: 204 })
}
