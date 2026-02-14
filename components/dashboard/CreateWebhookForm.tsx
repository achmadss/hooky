'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { generateToken, sanitizeToken, validateToken } from '@/lib/token'
import { cn } from '@/lib/utils'
import { RefreshCw, Plus, AlertCircle } from 'lucide-react'

interface CreateWebhookFormProps {
    onSuccess?: () => void
}

export default function CreateWebhookForm({ onSuccess }: CreateWebhookFormProps) {
    const router = useRouter()
    const [token, setToken] = useState('')
    const [customName, setCustomName] = useState('')
    const [visibility, setVisibility] = useState<'public' | 'private'>('public')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [isCustom, setIsCustom] = useState(false)

    const handleGenerateToken = () => {
        setToken(generateToken())
        setIsCustom(false)
        setError('')
    }

    const handleCustomTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value
        const sanitized = sanitizeToken(raw)
        setToken(sanitized)
        setIsCustom(true)

        if (raw !== sanitized) {
            // transient visual feedback could go here
        }

        if (sanitized) {
            const { valid, error } = validateToken(sanitized)
            if (!valid && error) setError(error)
            else setError('')
        } else {
            setError('')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        // Final validation
        if (!token) {
            setError('Token is required')
            setLoading(false)
            return
        }
        const { valid, error: valError } = validateToken(token)
        if (!valid && valError) {
            setError(valError)
            setLoading(false)
            return
        }

        try {
            const res = await fetch('/api/webhooks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, name: customName, visibility }),
            })

            if (!res.ok) {
                let errorMessage = 'Failed to create webhook'
                try {
                    const data = await res.json()
                    errorMessage = data.error || errorMessage
                } catch {
                    // Response might not be JSON
                }
                throw new Error(errorMessage)
            }

            setToken('')
            setCustomName('')
            setIsCustom(false)
            router.refresh()
            if (onSuccess) onSuccess()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    // Generate a token on mount if empty? No, let user choose.
    // Actually, better UX might be to have one ready or easy to click.
    // Let's just have the button.

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm mb-8">
            <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Create New Webhook
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                            Webhook Token
                        </label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={token}
                                    onChange={handleCustomTokenChange}
                                    placeholder="custom-token-name"
                                    className={cn(
                                        "w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border rounded-md focus:outline-none focus:ring-2 transition-colors font-mono text-sm text-zinc-900 dark:text-white placeholder-zinc-400",
                                        error ? "border-red-500 focus:ring-red-200" : "border-zinc-300 dark:border-zinc-700 focus:ring-blue-200"
                                    )}
                                />
                            </div>
                            <button
                                type="button"
                                onClick={handleGenerateToken}
                                className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400 rounded-md border border-zinc-300 dark:border-zinc-700 transition-colors"
                                title="Generate Random Token"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">
                            {isCustom ? 'Custom tokens must be unique.' : 'Randomly generated secure token.'}
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                            Description (Optional)
                        </label>
                        <input
                            type="text"
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                            placeholder="My Test Webhook"
                            className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200 transition-colors text-sm text-zinc-900 dark:text-white"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                            Visibility
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="visibility"
                                    value="private"
                                    checked={visibility === 'private'}
                                    onChange={() => setVisibility('private')}
                                    className="w-4 h-4 text-blue-600 border-zinc-300 focus:ring-blue-500"
                                />
                                <span className="text-sm text-zinc-700 dark:text-zinc-300">Private</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="visibility"
                                    value="public"
                                    checked={visibility === 'public'}
                                    onChange={() => setVisibility('public')}
                                    className="w-4 h-4 text-blue-600 border-zinc-300 focus:ring-blue-500"
                                />
                                <span className="text-sm text-zinc-700 dark:text-zinc-300">Public</span>
                            </label>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">
                            {visibility === 'public' ? 'Anyone can view this webhook details.' : 'Only you can view this webhook.'}
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 p-3 rounded-md">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={loading || !token}
                        className={cn(
                            "px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium text-sm transition-colors flex items-center gap-2",
                            (loading || !token) && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Create Webhook
                    </button>
                </div>
            </form>
        </div>
    )
}
