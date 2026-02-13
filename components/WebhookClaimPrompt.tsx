'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

// Task 17.1: WebhookClaimPrompt modal component
export default function WebhookClaimPrompt() {
    const { data: session, status } = useSession()
    const [unclaimedWebhook, setUnclaimedWebhook] = useState<{ id: string; token: string } | null>(null)
    const [visible, setVisible] = useState(false)
    const [loading, setLoading] = useState(false)
    const [claimed, setClaimed] = useState(false)
    const router = useRouter()

    // Task 17.2: Detect unclaimed webhook when user logs in
    useEffect(() => {
        if (status !== 'authenticated') return

        // Only show claim prompt if user just logged in (indicated by sessionStorage flag)
        // This prevents the modal from showing on direct URL visits for authenticated users
        const justLoggedIn = sessionStorage.getItem('hooky_just_logged_in')
        if (!justLoggedIn) return

        sessionStorage.removeItem('hooky_just_logged_in')

        fetch('/api/webhooks/unclaimed')
            .then((r) => r.ok ? r.json() : null)
            .then((data) => {
                // API returns { webhook: {...} }
                if (data?.webhook?.id) {
                    setUnclaimedWebhook(data.webhook)
                    setVisible(true)
                }
            })
            .catch(() => null)
    }, [status, session])

    if (!visible || !unclaimedWebhook || !session) return null

    // Task 17.4: "Add to My Account" functionality
    async function handleClaim() {
        setLoading(true)
        try {
            const res = await fetch('/api/webhooks/claim', { method: 'POST' })
            if (res.ok) {
                setClaimed(true)
                // Task 17.8: Redirect to dashboard after claiming
                setTimeout(() => {
                    setVisible(false)
                    router.push('/')
                }, 1500)
            }
        } catch { /* ignore */ }
        setLoading(false)
    }

    // Task 17.5: "Keep Anonymous" functionality
    function handleDecline() {
        setVisible(false)
        // Task 17.8: Redirect to dashboard after declining
        router.push('/')
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <div className="relative bg-white dark:bg-zinc-900 rounded-xl shadow-xl w-full max-w-md mx-4 p-6 border border-gray-200 dark:border-zinc-700">
                {claimed ? (
                    // Task 17.6: Success message after claiming
                    <div className="text-center py-4">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Webhook added to your account!</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Redirecting to dashboard...</p>
                    </div>
                ) : (
                    <>
                        <div className="mb-4">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Save your webhook?</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                You have an anonymous webhook that will be deleted in 6 days.
                            </p>
                        </div>

                        {/* Task 17.3: Display webhook details */}
                        <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-3 mb-6 border border-gray-200 dark:border-zinc-700">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Webhook token</p>
                            <p className="font-mono text-sm font-medium text-gray-900 dark:text-white">{unclaimedWebhook.token}</p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleClaim}
                                disabled={loading}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors"
                            >
                                {loading ? 'Saving...' : 'Add to My Account'}
                            </button>
                            <button
                                onClick={handleDecline}
                                disabled={loading}
                                className="flex-1 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 font-medium py-2 px-4 rounded-lg text-sm transition-colors"
                            >
                                Keep Anonymous
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
