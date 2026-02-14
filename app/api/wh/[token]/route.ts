import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { db } from '@/lib/db/index'
import { webhooks, requests, responseConfigs } from '@/lib/db/schema'
import { getIO } from '@/lib/socket'
import { eq, and, isNull } from 'drizzle-orm'

const MAX_BODY_MB = parseInt(process.env.MAX_REQUEST_BODY_SIZE_MB ?? '50', 10)
const MAX_BODY_BYTES = MAX_BODY_MB * 1024 * 1024

const BINARY_PREFIXES = ['image/', 'video/', 'audio/', 'application/octet-stream']

async function handler(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  const webhookResult = await db.select().from(webhooks).where(
    and(eq(webhooks.token, token), eq(webhooks.isEnabled, true), isNull(webhooks.deletedAt))
  ).limit(1)
  const webhook = webhookResult[0]

  if (!webhook) {
    return new NextResponse(null, { status: 404 })
  }

  const contentType = request.headers.get('content-type') ?? ''

  if (BINARY_PREFIXES.some((p) => contentType.startsWith(p))) {
    return NextResponse.json(
      { error: 'Binary content types are not supported' },
      { status: 415 }
    )
  }

  const contentLength = parseInt(request.headers.get('content-length') ?? '0', 10)
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Payload Too Large' }, { status: 413 })
  }

  let body: string | null = null
  try {
    const raw = await request.arrayBuffer()
    if (raw.byteLength > MAX_BODY_BYTES) {
      return NextResponse.json({ error: 'Payload Too Large' }, { status: 413 })
    }
    body = raw.byteLength > 0 ? new TextDecoder().decode(raw) : null
  } catch {
    // ignore body read errors
  }

  const headers: Record<string, string> = {}
  request.headers.forEach((value, key) => {
    if (!key.startsWith('x-nextjs')) headers[key] = value
  })

  const queryParams: Record<string, string> = {}
  request.nextUrl.searchParams.forEach((value, key) => {
    queryParams[key] = value
  })

  const sourceIp =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    '0.0.0.0'
  const userAgent = request.headers.get('user-agent') ?? null

  const result = await db.insert(requests).values({
    webhookId: webhook.id,
    webhookToken: token,
    method: request.method,
    headers,
    queryParams,
    body,
    sourceIp,
    userAgent,
  }).returning()
  const captured = result[0]

  getIO()?.to(`webhook:${webhook.id}`).emit('new-request', captured)

  const configResult = await db.select().from(responseConfigs).where(
    and(eq(responseConfigs.webhookId, webhook.id), isNull(responseConfigs.deletedAt))
  ).limit(1)
  const config = configResult[0]

  const status = config?.statusCode ?? 200
  const responseBody = config?.body ?? ''
  const responseHeaders = (config?.headers as Record<string, string>) ?? {}
  const finalHeaders: Record<string, string> = {
    'content-type': 'text/plain',
    ...responseHeaders,
  }

  return new NextResponse(responseBody, { status, headers: finalHeaders })
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
export const HEAD = handler
export const OPTIONS = handler
