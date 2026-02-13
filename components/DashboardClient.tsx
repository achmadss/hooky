'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import CreateWebhookForm from '@/components/dashboard/CreateWebhookForm'
import WebhookList from '@/components/dashboard/WebhookList'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Webhook } from '@prisma/client'

type WebhookWithCount = Webhook & { _count: { requests: number } }

interface PaginationInfo {
    page: number
    limit: number
    total: number
    totalPages: number
}

interface DashboardClientProps {
    initialWebhooks: WebhookWithCount[]
    initialPagination: PaginationInfo
}

export default function DashboardClient({ initialWebhooks, initialPagination }: DashboardClientProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    
    const [webhooks, setWebhooks] = useState<WebhookWithCount[]>(initialWebhooks)
    const [pagination, setPagination] = useState<PaginationInfo>(initialPagination)
    const [search, setSearch] = useState(searchParams.get('search') || '')
    const [loading, setLoading] = useState(false)
    const isInitialMount = useRef(true)

    const fetchWebhooks = async (page: number = 1, searchQuery?: string) => {
        const query = searchQuery !== undefined ? searchQuery : search
        setLoading(true)
        try {
            const params = new URLSearchParams()
            params.set('page', page.toString())
            params.set('limit', '10')
            if (query) {
                params.set('search', query)
            }

            const res = await fetch(`/api/webhooks?${params.toString()}`)
            const data = await res.json()
            setWebhooks(data.webhooks)
            setPagination(data.pagination)
            
            const newParams = new URLSearchParams()
            if (query) {
                newParams.set('search', query)
            }
            newParams.set('page', page.toString())
            router.push(`/?${newParams.toString()}`, { scroll: false })
        } catch (error) {
            console.error('Failed to fetch webhooks', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // Skip the first render since we already have initial data from server
        if (isInitialMount.current) {
            isInitialMount.current = false
            return
        }

        const debounce = setTimeout(() => {
            fetchWebhooks(1, search)
        }, 300)

        return () => clearTimeout(debounce)
    }, [search])

    const handlePageChange = (newPage: number) => {
        fetchWebhooks(newPage, search)
    }

    return (
        <main className="min-h-screen p-8 bg-zinc-50 dark:bg-black font-sans">
            <div className="max-w-5xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Dashboard</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2">Manage your webhooks and inspect captured requests.</p>
                </header>

                <CreateWebhookForm />

                <div className="mt-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">Your Webhooks</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search webhooks..."
                                className="pl-9 pr-4 py-2 w-64 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    
                    <WebhookList webhooks={webhooks} loading={loading} />
                    
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6">
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} webhooks
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page <= 1}
                                    className="p-2 rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                                    Page {pagination.page} of {pagination.totalPages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.totalPages}
                                    className="p-2 rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
