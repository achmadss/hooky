import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { requireAuth } from '@/lib/api-auth'
import { generateToken, sanitizeToken, validateToken } from '@/lib/token'

// Task 3.5: GET /api/webhooks — list webhooks for authenticated user only
export async function GET(request: NextRequest) {
  const { error, userId } = await requireAuth()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')

  const where = {
    ownerId: userId,
    ...(search && {
      OR: [
        { token: { contains: search, mode: 'insensitive' as const } },
        { name: { contains: search, mode: 'insensitive' as const } },
      ],
    }),
  }

  const [webhooks, total] = await Promise.all([
    prisma.webhook.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: { _count: { select: { requests: true } } },
    }),
    prisma.webhook.count({ where }),
  ])

  return NextResponse.json({
    webhooks,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}

// Task 3.1: POST /api/webhooks — create webhook (authenticated only)
export async function POST(request: NextRequest) {
  try {
    const { error, userId } = await requireAuth()
    if (error) return error

    let body
    try {
      body = await request.json()
    } catch (e) {
      console.error('Failed to parse request body:', e)
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
    
    const { name, token: customToken } = body as { name?: string; token?: string } || {}

    if (!customToken) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    // Task 3.3: Sanitize custom token
    const token = sanitizeToken(customToken)
    
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

    const webhook = await prisma.webhook.create({
      data: { token, name: name ?? null, ownerId: userId },
    })

    return NextResponse.json(webhook, { status: 201 })
  } catch (e) {
    console.error('Error creating webhook:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
