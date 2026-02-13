'use client'

import { useState } from 'react'
import GlobalNavbar from '@/components/GlobalNavbar'
import AuthModal from '@/components/AuthModal'
import WebhookClaimPrompt from '@/components/WebhookClaimPrompt'

// Task 18.7: App shell wraps the layout with navbar + auth modal + claim prompt
export default function AppShell({ children }: { children: React.ReactNode }) {
    const [authModalOpen, setAuthModalOpen] = useState(false)
    const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login')

    function openAuthModal(mode: 'login' | 'register' = 'login') {
        setAuthModalMode(mode)
        setAuthModalOpen(true)
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-zinc-950">
            <GlobalNavbar onOpenAuthModal={openAuthModal} />
            <div className="flex-1 flex flex-col">
                {children}
            </div>
            <AuthModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                initialMode={authModalMode}
            />
            {/* Task 17.1: Webhook claim prompt shown after login */}
            <WebhookClaimPrompt />
        </div>
    )
}
