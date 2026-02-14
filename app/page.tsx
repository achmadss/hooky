import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAnonymousSessionId } from '@/lib/session'
import { db } from '@/lib/db/index'
import { webhooks, requests } from '@/lib/db/schema'
import { eq, and, isNull, desc, like, or, sql } from 'drizzle-orm'
import Dashboard from '@/components/Dashboard'

export default async function Home({ searchParams }: { searchParams: Promise<{ search?: string; page?: string }> }) {
  const { search, page } = await searchParams
  const session = await getServerSession(authOptions)

  if (session?.user?.id) {
    const pageNum = parseInt(page || '1')
    const limit = 10
    const searchQuery = search || ''
    const offset = (pageNum - 1) * limit

    const where = searchQuery
      ? and(
          eq(webhooks.ownerId, session.user.id),
          isNull(webhooks.deletedAt),
          or(
            like(webhooks.token, `%${searchQuery}%`),
            like(webhooks.name, `%${searchQuery}%`)
          )
        )
      : and(eq(webhooks.ownerId, session.user.id), isNull(webhooks.deletedAt))

    const webhooksResult = await db.select().from(webhooks).where(where).orderBy(desc(webhooks.createdAt)).limit(limit).offset(offset)

    const countResult = await db.select({ count: sql<number>`count(*)` }).from(webhooks).where(where)
    const total = countResult[0]?.count || 0

    const webhooksWithCount = await Promise.all(
      webhooksResult.map(async (wh) => {
        const reqCount = await db.select({ count: sql<number>`count(*)` }).from(requests).where(
          and(eq(requests.webhookId, wh.id), isNull(requests.deletedAt))
        )
        return { ...wh, _count: { requests: reqCount[0]?.count || 0 } }
      })
    )

    const pagination = {
      page: pageNum,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }

    return <Dashboard webhooks={webhooksWithCount} pagination={pagination} />
  }

  const anonSessionId = await getAnonymousSessionId()

  if (anonSessionId) {
    const existing = await db.select().from(webhooks).where(
      and(eq(webhooks.sessionId, anonSessionId), isNull(webhooks.ownerId), isNull(webhooks.deletedAt))
    ).limit(1)
    if (existing[0]) {
      redirect(`/webhooks/${existing[0].id}`)
    }
  }

  redirect('/api/init')
}
