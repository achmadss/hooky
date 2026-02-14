import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAnonymousSessionId } from '@/lib/session'
import { db } from '@/lib/db/index'
import { webhooks, requests } from '@/lib/db/schema'
import { Request } from '@/lib/types'
import { eq, and, isNull, desc } from 'drizzle-orm'
import RequestList from '@/components/RequestList'
import RequestDetail from '@/components/RequestDetail'
import WebhookUrlDisplay from '@/components/WebhookUrlDisplay'
import AnonymousBanner from '@/components/AnonymousBanner'
import WebhookDetailActions from '@/components/WebhookDetailActions'
import Link from 'next/link'

interface PageProps {
    params: Promise<{ id: string }>
    searchParams: Promise<{ requestId?: string }>
}

export default async function WebhookDetailPage({ params, searchParams }: PageProps) {
    const { id } = await params
    const { requestId } = await searchParams

    const session = await getServerSession(authOptions)
    const anonSessionId = await getAnonymousSessionId()

    const webhookResult = await db.select().from(webhooks).where(
        and(eq(webhooks.id, id), isNull(webhooks.deletedAt))
    ).limit(1)
    const webhook = webhookResult[0]

    if (!webhook) {
        notFound()
    }

    const isOwner = session?.user?.id === webhook.ownerId
    const isAnonymousOwner = !webhook.ownerId && webhook.sessionId === anonSessionId
    const isAuthenticated = !!session?.user?.id

    const canView = isOwner || isAnonymousOwner || webhook.visibility === 'public'

    if (!canView) {
        notFound()
    }

    const requestsResult = await db.select().from(requests).where(
        and(eq(requests.webhookId, id), isNull(requests.deletedAt))
    ).orderBy(desc(requests.timestamp))

    const selectedRequest = requestId
        ? requestsResult.find((r) => r.id === requestId)
        : requestsResult.length > 0 ? requestsResult[0] : null

    return (
        <div className="flex flex-col h-[calc(100vh-56px)] bg-gray-50 dark:bg-zinc-950 overflow-hidden">
            <div className="border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 sm:px-6 py-2 flex items-center gap-4 shrink-0">
                {isAuthenticated && (
                    <Link
                        href="/"
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 shrink-0"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span className="hidden sm:inline">Dashboard</span>
                    </Link>
                )}

                <div className="flex-1 min-w-0">
                    <WebhookUrlDisplay token={webhook.token} />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        webhook.visibility === 'public'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                        {webhook.visibility === 'public' ? 'Public' : 'Private'}
                    </span>
                </div>

                <WebhookDetailActions
                    webhookId={id}
                    webhookToken={webhook.token}
                    webhookName={webhook.name}
                    isEnabled={webhook.isEnabled}
                    isOwner={isOwner}
                    visibility={webhook.visibility}
                />
            </div>

            {isAnonymousOwner && <AnonymousBanner />}

            <div className="flex flex-1 overflow-hidden">
                <div className="w-full md:w-80 border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0">
                    <RequestList requests={requestsResult} webhookId={id} defaultSelectedId={selectedRequest?.id} />
                </div>

                <div className={`flex-1 flex flex-col overflow-hidden ${requestId ? 'flex' : 'hidden md:flex'}`}>
                    <div className="flex-1 overflow-y-auto p-0 sm:p-0">
                        {selectedRequest ? (
                            <RequestDetail request={selectedRequest} webhookToken={selectedRequest.webhookToken || webhook.token} />
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <svg className="w-16 h-16 mb-4 text-gray-200 dark:text-zinc-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 6h16M4 12h16m-7 6h7" />
                                </svg>
                                <p className="text-sm">Select a request to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
