import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAnonymousSessionId } from '@/lib/session'
import prisma from '@/lib/db'
import Dashboard from '@/components/Dashboard'

export default async function Home() {
  const session = await getServerSession(authOptions)

  // Authenticated users see the management dashboard
  if (session?.user?.id) {
    const webhooks = await prisma.webhook.findMany({
      where: { ownerId: session.user.id },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { requests: true } } },
    })
    return <Dashboard webhooks={webhooks} />
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
