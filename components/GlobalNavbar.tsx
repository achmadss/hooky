'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useTheme } from 'next-themes'
import { useState, useRef, useEffect } from 'react'
import { Zap } from 'lucide-react'

// Task 18.5: Profile Avatar with initials fallback
function ProfileAvatar({ name, email }: { name?: string | null; email?: string | null }) {
    const initials = (name || email || '?').charAt(0).toUpperCase()
    return (
        <div className="w-8 h-8 rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center text-sm font-semibold select-none">
            {initials}
        </div>
    )
}

// Task 14.4: Dark mode toggle button
function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)
    useEffect(() => setMounted(true), [])
    if (!mounted) return <div className="w-8 h-8" />

    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

    return (
        <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className="p-1.5 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            title="Toggle theme"
        >
            {isDark ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
            )}
        </button>
    )
}

// Task 18.6: Profile Dropdown menu
function ProfileDropdown({ onOpenAuthModal }: { onOpenAuthModal?: (mode?: 'login' | 'register') => void }) {
    const { data: session } = useSession()
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    if (!session) {
        // Anonymous user: show Login/Sign Up buttons
        return (
            <div className="flex items-center gap-2">
                <ThemeToggle />
                <button
                    onClick={() => onOpenAuthModal?.('login')}
                    className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                >
                    Log In
                </button>
                <button
                    onClick={() => onOpenAuthModal?.('register')}
                    className="text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md transition-colors"
                >
                    Sign Up
                </button>
            </div>
        )
    }

    return (
        <div className="relative flex items-center gap-2" ref={ref}>
            <ThemeToggle />
            <button
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full hover:ring-2 hover:ring-blue-500 transition-all"
            >
                <ProfileAvatar name={session.user?.name} email={session.user?.email} />
            </button>

            {open && (
                <div className="absolute right-0 top-10 w-48 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-lg py-1 z-50">
                    <div className="px-3 py-2 border-b border-gray-200 dark:border-zinc-700">
                        <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">{session.user?.name || session.user?.email}</p>
                        {session.user?.name && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{session.user?.email}</p>
                        )}
                    </div>
                    <Link
                        href="/dashboard"
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Dashboard
                    </Link>
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Log Out
                    </button>
                </div>
            )}
        </div>
    )
}

// Task 18.4: Global Navbar component (App Name left, Profile right)
export default function GlobalNavbar({ onOpenAuthModal }: { onOpenAuthModal?: (mode?: 'login' | 'register') => void }) {
    return (
        <nav className="h-14 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center px-4 sm:px-6 justify-between shrink-0 z-40 sticky top-0">
            <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Hooky</span>
            </Link>
            <ProfileDropdown onOpenAuthModal={onOpenAuthModal} />
        </nav>
    )
}
