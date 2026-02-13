'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import AuthModal from '@/components/AuthModal'

// Task 16.7 / 16.8: Anonymous mode banner with retention warning and Sign Up CTA
export default function AnonymousBanner() {
    const { data: session } = useSession()
    const [authOpen, setAuthOpen] = useState(false)

    return (
        <>
            <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-4 py-2 text-sm text-amber-800 dark:text-amber-300 flex items-center gap-2 shrink-0">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {session ? (
                    // Authenticated but webhook not yet claimed — claim prompt will appear automatically
                    <span>
                        <strong>Webhook not claimed</strong> — requests auto-deleted after 6 days. Claim this webhook to save it permanently.
                    </span>
                ) : (
                    <span>
                        <strong>Anonymous mode</strong> — requests auto-deleted after 6 days.{' '}
                        <button
                            onClick={() => setAuthOpen(true)}
                            className="font-semibold underline hover:no-underline"
                        >
                            Sign up to save permanently
                        </button>
                    </span>
                )}
            </div>
            {!session && (
                <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} initialMode="register" />
            )}
        </>
    )
}
