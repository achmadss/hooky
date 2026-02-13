import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { requireWebhookOwnership } from '@/lib/api-auth'

type Params = { params: Promise<{ id: string }> }

// Task 6.1: GET /api/webhooks/[id]/response — get response config
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const { error } = await requireWebhookOwnership(id)
  if (error) return error

  const config = await prisma.responseConfig.findUnique({ where: { webhookId: id } })
  // Task 6.6: Return default response info when no config exists
  if (!config) {
    return NextResponse.json({ statusCode: 200, headers: {}, body: null, isDefault: true })
  }
  return NextResponse.json({ ...config, isDefault: false })
}

// Task 6.2: PUT /api/webhooks/[id]/response — upsert response config
export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params
  const { error } = await requireWebhookOwnership(id)
  if (error) return error

  const body = await request.json().catch(() => ({}))
  const { statusCode, headers, body: responseBody } = body as {
    statusCode?: number
    headers?: Record<string, string>
    body?: string
  }

  // Task 6.3: Validate status code
  if (statusCode !== undefined && (statusCode < 100 || statusCode > 599)) {
    return NextResponse.json({ error: 'Status code must be between 100 and 599' }, { status: 422 })
  }

  const config = await prisma.responseConfig.upsert({
    where: { webhookId: id },
    create: {
      webhookId: id,
      statusCode: statusCode ?? 200,
      headers: headers ?? {},
      body: responseBody ?? null,
    },
    update: {
      ...(statusCode !== undefined && { statusCode }),
      ...(headers !== undefined && { headers }),
      ...(responseBody !== undefined && { body: responseBody }),
    },
  })
  return NextResponse.json(config)
}

// Task 6.4: DELETE /api/webhooks/[id]/response — reset to defaults
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const { error } = await requireWebhookOwnership(id)
  if (error) return error

  await prisma.responseConfig.deleteMany({ where: { webhookId: id } })
  return new NextResponse(null, { status: 204 })
}
