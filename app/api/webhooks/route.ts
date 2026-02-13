import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'
import { generateToken, sanitizeToken, validateToken } from '@/lib/token'

// Task 3.5: GET /api/webhooks — list webhooks for authenticated user only
export async function GET() {
  const { error, userId } = await requireAuth()
  if (error) return error

  const webhooks = await prisma.webhook.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { requests: true } } },
  })

  return NextResponse.json(webhooks)
}

// Task 3.1: POST /api/webhooks — create webhook (authenticated only)
export async function POST(request: NextRequest) {
  const { error, userId } = await requireAuth()
  if (error) return error

  const body = await request.json().catch(() => ({}))
  const { name, token: customToken } = body as { name?: string; token?: string }

  let token: string
  if (customToken !== undefined && customToken !== '') {
    // Task 3.3: Sanitize custom token
    token = sanitizeToken(customToken)
    // Task 3.4: Validate sanitized token
    const { valid, error: tokenError } = validateToken(token)
    if (!valid) {
      return NextResponse.json({ error: tokenError }, { status: 422 })
    }
    // Task 3.4: Unique check
    const existing = await prisma.webhook.findUnique({ where: { token } })
    if (existing) {
      return NextResponse.json({ error: 'Token already in use' }, { status: 409 })
    }
  } else {
    // Task 3.2: Auto-generate token
    token = generateToken()
    while (await prisma.webhook.findUnique({ where: { token } })) {
      token = generateToken()
    }
  }

  const webhook = await prisma.webhook.create({
    data: { token, name: name ?? null, ownerId: userId },
  })

  return NextResponse.json(webhook, { status: 201 })
}
