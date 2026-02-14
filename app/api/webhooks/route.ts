import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { db } from '@/lib/db/index'
import { webhooks, requests } from '@/lib/db/schema'
import { requireAuth } from '@/lib/api-auth'
import { generateToken, sanitizeToken, validateToken } from '@/lib/token'
import { eq, and, isNull, desc, like, or, sql } from 'drizzle-orm'

export async function GET(request: NextRequest) {
  const { error, userId } = await requireAuth()
  if (error) return error

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const offset = (page - 1) * limit

  const where = search
    ? and(
        eq(webhooks.ownerId, userId),
        isNull(webhooks.deletedAt),
        or(
          like(webhooks.token, `%${search}%`),
          like(webhooks.name, `%${search}%`)
        )
      )
    : and(eq(webhooks.ownerId, userId), isNull(webhooks.deletedAt))

  const webhooksResult = await db.select().from(webhooks).where(where).orderBy(desc(webhooks.createdAt)).limit(limit).offset(offset)

  const countResult = await db.select({ count: sql<number>`count(*)` }).from(webhooks).where(where)
  const total = countResult[0]?.count || 0

  const webhooksWithCount = await Promise.all(
    webhooksResult.map(async (webhook) => {
      const reqCount = await db.select({ count: sql<number>`count(*)` }).from(requests).where(
        and(eq(requests.webhookId, webhook.id), isNull(requests.deletedAt))
      )
      return { ...webhook, _count: { requests: reqCount[0]?.count || 0 } }
    })
  )

  return NextResponse.json({
    webhooks: webhooksWithCount,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
}

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
    
    const { name, token: customToken, visibility } = body as { name?: string; token?: string; visibility?: string } || {}

    if (!customToken) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    const token = sanitizeToken(customToken)
    
    const { valid, error: tokenError } = validateToken(token)
    if (!valid) {
      return NextResponse.json({ error: tokenError }, { status: 422 })
    }
    
    const existing = await db.select().from(webhooks).where(eq(webhooks.token, token)).limit(1)
    if (existing[0]) {
      return NextResponse.json({ error: 'Token already in use' }, { status: 409 })
    }

    const webhookVisibility = visibility === 'public' ? 'public' : 'private'
    const result = await db.insert(webhooks).values({ 
      token, 
      name: name ?? null, 
      ownerId: userId,
      visibility: webhookVisibility,
    }).returning()
    const webhook = result[0]

    return NextResponse.json(webhook, { status: 201 })
  } catch (e) {
    console.error('Error creating webhook:', e)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
