import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAnonymousSessionId } from '@/lib/session'
import prisma from '@/lib/db'
import Dashboard from '@/components/Dashboard'

export default async function Home({ searchParams }: { searchParams: Promise<{ search?: string; page?: string }> }) {
  const { search, page } = await searchParams
  const session = await getServerSession(authOptions)

  // Authenticated users see the management dashboard
  if (session?.user?.id) {
    const pageNum = parseInt(page || '1')
    const limit = 10
    const searchQuery = search || ''

    const where = {
      ownerId: session.user.id,
      ...(searchQuery && {
        OR: [
          { token: { contains: searchQuery, mode: 'insensitive' as const } },
          { name: { contains: searchQuery, mode: 'insensitive' as const } },
        ],
      }),
    }

    const [webhooks, total] = await Promise.all([
      prisma.webhook.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (pageNum - 1) * limit,
        take: limit,
        include: { _count: { select: { requests: true } } },
      }),
      prisma.webhook.count({ where }),
    ])

    const pagination = {
      page: pageNum,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }

    return <Dashboard webhooks={webhooks} pagination={pagination} />
  }

  const anonSessionId = await getAnonymousSessionId()

  if (anonSessionId) {
    // Check for existing anonymous webhook
    const existing = await prisma.webhook.findFirst({
      where: { sessionId: anonSessionId, ownerId: null },
    })
    if (existing) {
      redirect(`/webhooks/${existing.id}`)
    }
  }

  // No session or session with no webhook — Route Handler sets the cookie and creates the webhook
  // (Cookies cannot be set in Server Components, only in Route Handlers)
  redirect('/api/init')
}
