'use client'

import WebhookListItem from './WebhookListItem'
import type { Webhook } from '@prisma/client'
import { Loader2 } from 'lucide-react'

type WebhookWithCount = Webhook & { _count: { requests: number } }

interface WebhookListProps {
    webhooks: WebhookWithCount[]
    loading?: boolean
    onUpdate?: () => void
    onDelete?: () => void
}

export default function WebhookList({ webhooks, loading = false, onUpdate, onDelete }: WebhookListProps) {
    if (loading && webhooks.length === 0) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
            </div>
        )
    }

    if (webhooks.length === 0) {
        return (
            <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700">
                <h3 className="mt-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">No webhooks</h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    Get started by creating a new webhook above.
                </p>
            </div>
        )
    }

    return (
        <ul className="space-y-4">
            {webhooks.map((webhook) => (
                <li key={webhook.id}>
                    <WebhookListItem webhook={webhook} onUpdate={onUpdate} onDelete={onDelete} />
                </li>
            ))}
        </ul>
    )
}
