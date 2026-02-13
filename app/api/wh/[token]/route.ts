import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { getIO } from '@/lib/socket'

// Task 5.8 / 5.9: Max request body size in bytes
const MAX_BODY_MB = parseInt(process.env.MAX_REQUEST_BODY_SIZE_MB ?? '50', 10)
const MAX_BODY_BYTES = MAX_BODY_MB * 1024 * 1024

// Task 5.12 / 5.13: Binary content-type prefixes to reject
const BINARY_PREFIXES = ['image/', 'video/', 'audio/', 'application/octet-stream']

// Task 5.1: Catch-all handler for all HTTP methods
async function handler(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  // Task 5.2: Validate webhook token exists and is enabled
  const webhook = await prisma.webhook.findUnique({ where: { token } })

  // Task 5.7: Return 404 for disabled webhooks (no capture)
  if (!webhook || !webhook.isEnabled) {
    return new NextResponse(null, { status: 404 })
  }

  const contentType = request.headers.get('content-type') ?? ''

  // Task 5.12: Reject binary content types
  if (BINARY_PREFIXES.some((p) => contentType.startsWith(p))) {
    return NextResponse.json(
      { error: 'Binary content types are not supported' },
      { status: 415 }
    )
  }

  // Task 5.8 / 5.10: Check content-length header before reading body
  const contentLength = parseInt(request.headers.get('content-length') ?? '0', 10)
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Payload Too Large' }, { status: 413 })
  }

  // Task 5.3: Extract request data
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

  // Task 5.3: Extract headers (exclude internal Next.js headers)
  const headers: Record<string, string> = {}
  request.headers.forEach((value, key) => {
    if (!key.startsWith('x-nextjs')) headers[key] = value
  })

  // Task 5.3: Extract query params
  const queryParams: Record<string, string> = {}
  request.nextUrl.searchParams.forEach((value, key) => {
    queryParams[key] = value
  })

  // Task 5.4: Extract metadata
  const sourceIp =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    '0.0.0.0'
  const userAgent = request.headers.get('user-agent') ?? null

  // Task 5.5: Persist request to database
  const captured = await prisma.request.create({
    data: {
      webhookId: webhook.id,
      method: request.method,
      headers,
      queryParams,
      body,
      sourceIp,
      userAgent,
    },
  })

  // Task 7.5: Broadcast new request to all clients watching this webhook
  getIO()?.to(`webhook:${webhook.id}`).emit('new-request', captured)

  // Task 5.6: Return configured response (or default 200)
  const config = await prisma.responseConfig.findUnique({ where: { webhookId: webhook.id } })

  const status = config?.statusCode ?? 200
  const responseBody = config?.body ?? ''
  const responseHeaders = (config?.headers as Record<string, string>) ?? {}
  const finalHeaders: Record<string, string> = {
    'content-type': 'text/plain',
    ...responseHeaders,
  }

  return new NextResponse(responseBody, { status, headers: finalHeaders })
}

// Task 5.1: Export all HTTP methods to the same handler
export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
export const HEAD = handler
export const OPTIONS = handler
