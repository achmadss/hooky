import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAnonymousSessionId } from '@/lib/session'
import prisma from '@/lib/db'
import RequestList from '@/components/RequestList'
import RequestDetail from '@/components/RequestDetail'
import WebhookUrlDisplay from '@/components/WebhookUrlDisplay'
import ResponseConfigPanel from '@/components/ResponseConfigPanel'
import AnonymousBanner from '@/components/AnonymousBanner'
import WebhookDetailActions from '@/components/WebhookDetailActions'
import Link from 'next/link'

interface PageProps {
    params: Promise<{ id: string }>
    searchParams: Promise<{ requestId?: string; tab?: string }>
}

export default async function WebhookDetailPage({ params, searchParams }: PageProps) {
    const { id } = await params
    const { requestId, tab } = await searchParams
    const activeTab = tab === 'response' ? 'response' : 'inspector'

    const session = await getServerSession(authOptions)
    const anonSessionId = await getAnonymousSessionId()

    const webhook = await prisma.webhook.findUnique({
        where: { id },
    })

    // Task 13.6: Handle 404 for non-existent webhooks
    if (!webhook) {
        notFound()
    }

    // Task 18.8: Ownership check for direct URL access
    const isOwner = session?.user?.id === webhook.ownerId
    const isAnonymousOwner = !webhook.ownerId && webhook.sessionId === anonSessionId
    const isAuthenticated = !!session?.user?.id

    // Authenticated users can view any webhook; anonymous users can only view their own
    const canView = isAuthenticated || isAnonymousOwner

    if (!canView) {
        notFound()
    }

    // Fetch requests
    const requests = await prisma.request.findMany({
        where: { webhookId: id },
        orderBy: { timestamp: 'desc' },
    })

    const selectedRequest = requestId
        ? requests.find(r => r.id === requestId)
        : requests.length > 0 ? requests[0] : null

    return (
        // Task 13.4: Responsive layout
        <div className="flex flex-col h-[calc(100vh-56px)] bg-gray-50 dark:bg-zinc-950 overflow-hidden">
            {/* Top bar with webhook URL, tabs, and navigation */}
            <div className="border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 sm:px-6 py-2 flex items-center gap-4 shrink-0">
                {/* Task 13.7/13.5: Back to Dashboard for authenticated users only */}
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

                {/* Task 17.7: Ownership indicator badge */}
                {isOwner && (
                    <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 shrink-0">
                        Owned
                    </span>
                )}

                {/* Task 5: Webhook detail page management for authenticated owners */}
                <WebhookDetailActions
                    webhookId={id}
                    webhookToken={webhook.token}
                    webhookName={webhook.name}
                    isEnabled={webhook.isEnabled}
                    isOwner={isOwner}
                />

                {/* Task 13.3: Tabs for Request Inspector and Response Config */}
                <div className="flex gap-1 shrink-0">
                    <Link
                        href={`/webhooks/${id}${requestId ? `?requestId=${requestId}` : ''}`}
                        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${activeTab === 'inspector'
                            ? 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white font-medium'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    >
                        Inspector
                    </Link>
                    <Link
                        href={`/webhooks/${id}?tab=response`}
                        className={`px-3 py-1.5 text-sm rounded-md transition-colors ${activeTab === 'response'
                            ? 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white font-medium'
                            : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    >
                        Response
                    </Link>
                </div>
            </div>

            {/* Task 10.8 / 16.7 / 16.8: Anonymous retention warning with Sign Up CTA */}
            {isAnonymousOwner && <AnonymousBanner />}

            {/* Content */}
            {activeTab === 'response' ? (
                <div className="flex-1 overflow-y-auto">
                    <div className="max-w-2xl mx-auto py-6 px-4">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Response Configuration</h2>
                        {/* Task 12.8: Hidden for anonymous users */}
                        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg">
                            <ResponseConfigPanel webhookId={id} isOwner={isOwner} />
                        </div>
                    </div>
                </div>
            ) : (
                // Request Inspector layout
                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar - Request List */}
                    <div className="w-full md:w-80 border-r border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col shrink-0">
                        <RequestList requests={requests} webhookId={id} defaultSelectedId={selectedRequest?.id} />
                    </div>

                    {/* Main Content - Request Detail (hidden on mobile unless selected) */}
                    <div className={`flex-1 flex flex-col overflow-hidden ${requestId ? 'flex' : 'hidden md:flex'}`}>
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                            {selectedRequest ? (
                                <RequestDetail request={selectedRequest} webhookToken={(selectedRequest as any).webhookToken || webhook.token} />
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
            )}
        </div>
    )
}
