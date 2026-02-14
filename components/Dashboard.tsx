import DashboardClient from './DashboardClient'
import type { Webhook } from '@/lib/types'

type WebhookWithCount = Webhook & { _count: { requests: number } }

interface PaginationInfo {
    page: number
    limit: number
    total: number
    totalPages: number
}

export default function Dashboard({ 
    webhooks,
    pagination 
}: { 
    webhooks: WebhookWithCount[]
    pagination?: PaginationInfo
}) {
    const defaultPagination: PaginationInfo = pagination || {
        page: 1,
        limit: 10,
        total: webhooks.length,
        totalPages: Math.ceil(webhooks.length / 10),
    }

    return (
        <DashboardClient 
            initialWebhooks={webhooks} 
            initialPagination={defaultPagination} 
        />
    )
}
