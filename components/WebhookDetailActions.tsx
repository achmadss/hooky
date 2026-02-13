'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Copy, Trash2, Power, Pencil, AlertTriangle, Check, X } from 'lucide-react'
import { useToast } from '@/components/ToastContext'
import Modal from '@/components/Modal'
import { cn } from '@/lib/utils'
import { sanitizeToken } from '@/lib/token'

interface WebhookDetailActionsProps {
    webhookId: string
    webhookToken: string
    webhookName: string | null
    isEnabled: boolean
    isOwner: boolean
}

export default function WebhookDetailActions({
    webhookId,
    webhookToken,
    webhookName,
    isEnabled,
    isOwner,
}: WebhookDetailActionsProps) {
    const router = useRouter()
    const { showToast } = useToast()
    const [loading, setLoading] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showToggleModal, setShowToggleModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [copied, setCopied] = useState(false)
    const [editName, setEditName] = useState(webhookName || '')
    const [editToken, setEditToken] = useState(webhookToken)

    if (!isOwner) return null

    const handleCopyUrl = () => {
        const url = `${window.location.origin}/api/wh/${webhookToken}`
        navigator.clipboard.writeText(url)
        setCopied(true)
        showToast('Webhook URL copied to clipboard', 'success')
        setTimeout(() => setCopied(false), 2000)
    }

    const handleSaveEdit = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/webhooks/${webhookId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editName, token: editToken }),
            })
            
            if (!res.ok) {
                const data = await res.json()
                showToast(data.error || 'Failed to update webhook', 'error')
                setLoading(false)
                return
            }
            
            showToast('Webhook updated successfully', 'success')
            router.refresh()
            setShowEditModal(false)
        } catch (error) {
            console.error('Failed to update webhook', error)
            showToast('Failed to update webhook', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleToggle = async () => {
        setLoading(true)
        try {
            await fetch(`/api/webhooks/${webhookId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isEnabled: !isEnabled }),
            })
            showToast(`Webhook ${isEnabled ? 'disabled' : 'enabled'} successfully`, 'success')
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
            await fetch(`/api/webhooks/${webhookId}`, {
                method: 'DELETE',
            })
            showToast('Webhook deleted successfully', 'success')
            router.push('/')
        } catch (error) {
            console.error('Failed to delete webhook', error)
            showToast('Failed to delete webhook', 'error')
        } finally {
            setLoading(false)
            setShowDeleteModal(false)
        }
    }

    const openEditModal = () => {
        setEditName(webhookName || '')
        setEditToken(webhookToken)
        setShowEditModal(true)
    }

    return (
        <>
            <div className="flex items-center gap-2 shrink-0">
                <button
                    onClick={handleCopyUrl}
                    className="p-2 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                    title="Copy Webhook URL"
                >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>

                <button
                    onClick={openEditModal}
                    className="p-2 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors"
                    title="Edit Webhook"
                >
                    <Pencil className="w-4 h-4" />
                </button>

                <button
                    onClick={() => setShowToggleModal(true)}
                    disabled={loading}
                    className={cn(
                        "p-2 rounded-md transition-colors",
                        isEnabled
                            ? "text-zinc-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                            : "text-zinc-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                    )}
                    title={isEnabled ? "Disable Webhook" : "Enable Webhook"}
                >
                    <Power className="w-4 h-4" />
                </button>

                <button
                    onClick={() => setShowDeleteModal(true)}
                    className="p-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    title="Delete Webhook"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>

            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Edit Webhook"
                confirmLabel="Save"
                onConfirm={handleSaveEdit}
                confirmVariant="primary"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                            Description
                        </label>
                        <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="My Webhook"
                            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                            Token
                        </label>
                        <input
                            type="text"
                            value={editToken}
                            onChange={(e) => setEditToken(sanitizeToken(e.target.value))}
                            placeholder="my-webhook-token"
                            className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-zinc-500 mt-1">
                            Token can only contain letters, numbers, and dashes
                        </p>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={showToggleModal}
                onClose={() => setShowToggleModal(false)}
                title={isEnabled ? 'Disable Webhook' : 'Enable Webhook'}
                confirmLabel={isEnabled ? 'Disable' : 'Enable'}
                onConfirm={handleToggle}
                confirmVariant={isEnabled ? 'danger' : 'primary'}
            >
                <p className="text-zinc-600 dark:text-zinc-400">
                    {isEnabled
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
