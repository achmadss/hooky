'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Copy, Trash2, Power, ExternalLink, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ToastContext'
import Modal from '@/components/Modal'
import type { Webhook } from '@prisma/client'

type WebhookWithCount = Webhook & { _count: { requests: number } }

export default function WebhookListItem({ webhook }: { webhook: WebhookWithCount }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showToggleModal, setShowToggleModal] = useState(false)
    const { showToast } = useToast()

    const handleCopyUrl = () => {
        const url = `${window.location.origin}/api/wh/${webhook.token}`
        navigator.clipboard.writeText(url)
        showToast('Webhook URL copied to clipboard', 'success')
    }

    const toggleEnabled = async () => {
        setLoading(true)
        try {
            await fetch(`/api/webhooks/${webhook.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isEnabled: !webhook.isEnabled }),
            })
            showToast(`Webhook ${webhook.isEnabled ? 'disabled' : 'enabled'} successfully`, 'success')
            router.refresh()
        } catch (error) {
            console.error('Failed to toggle webhook', error)
            showToast('Failed to toggle webhook', 'error')
        } finally {
            setLoading(false)
            setShowToggleModal(false)
        }
    }

    const handleDelete = async () => {
        setLoading(true)
        try {
            await fetch(`/api/webhooks/${webhook.id}`, {
                method: 'DELETE',
            })
            showToast('Webhook deleted successfully', 'success')
            router.refresh()
        } catch (error) {
            console.error('Failed to delete webhook', error)
            showToast('Failed to delete webhook', 'error')
        } finally {
            setLoading(false)
            setShowDeleteModal(false)
        }
    }

    return (
        <>
            <div className={cn(
                "group relative flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border rounded-lg transition-all",
                webhook.isEnabled ? "border-zinc-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700" : "border-zinc-200 dark:border-zinc-800 opacity-75 bg-zinc-50 dark:bg-zinc-900/50"
            )}>
                <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Link
                            href={`/webhooks/${webhook.id}`}
                            className="font-mono text-blue-600 dark:text-blue-400 font-medium hover:underline truncate"
                        >
                            {webhook.token}
                        </Link>
                        {!webhook.isEnabled && (
                            <span className="px-2 py-0.5 text-xs bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-full font-medium">
                                Disabled
                            </span>
                        )}
                    </div>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-4">
                        <span className="truncate">{webhook.name || 'No description'}</span>
                        <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                        <span>{webhook._count.requests} requests</span>
                        <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                        <span>{new Date(webhook.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                    <button
                        onClick={handleCopyUrl}
                        className="p-2 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                        title="Copy Webhook URL"
                    >
                        <Copy className="w-4 h-4" />
                    </button>

                    <button
                        onClick={() => setShowToggleModal(true)}
                        disabled={loading}
                        className={cn(
                            "p-2 rounded-md transition-colors",
                            webhook.isEnabled
                                ? "text-zinc-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                                : "text-zinc-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                        )}
                        title={webhook.isEnabled ? "Disable Webhook" : "Enable Webhook"}
                    >
                        <Power className="w-4 h-4" />
                    </button>

                    <button
                        onClick={() => setShowDeleteModal(true)}
                        disabled={loading}
                        className="p-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                        title="Delete Webhook"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>

                    <Link
                        href={`/webhooks/${webhook.id}`}
                        className="p-2 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                        title="Inspect Requests"
                    >
                        <ExternalLink className="w-4 h-4" />
                    </Link>
                </div>
            </div>

            <Modal
                isOpen={showToggleModal}
                onClose={() => setShowToggleModal(false)}
                title={webhook.isEnabled ? 'Disable Webhook' : 'Enable Webhook'}
                confirmLabel={webhook.isEnabled ? 'Disable' : 'Enable'}
                onConfirm={toggleEnabled}
                confirmVariant={webhook.isEnabled ? 'danger' : 'primary'}
            >
                <p className="text-zinc-600 dark:text-zinc-400">
                    {webhook.isEnabled
                        ? 'Are you sure you want to disable this webhook? It will no longer capture requests until re-enabled.'
                        : 'Are you sure you want to enable this webhook? It will start capturing requests again.'}
                </p>
            </Modal>

            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete Webhook"
                confirmLabel="Delete"
                onConfirm={handleDelete}
                confirmVariant="danger"
            >
                <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                    <p>
                        Are you sure you want to delete this webhook? This action cannot be undone and all captured requests will be permanently deleted.
                    </p>
                </div>
            </Modal>
        </>
    )
}
