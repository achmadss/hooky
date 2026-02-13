'use client'

import { Request } from '@prisma/client'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useWebSocket } from '@/contexts/WebSocketContext'

interface RequestListProps {
    requests: Request[]
    webhookId: string
    defaultSelectedId?: string
}

export default function RequestList({ requests: initialRequests, webhookId, defaultSelectedId }: RequestListProps) {
    const [requests, setRequests] = useState<Request[]>(initialRequests)
    const searchParams = useSearchParams()
    const urlSelectedId = searchParams.get('requestId')
    const selectedRequestId = urlSelectedId || defaultSelectedId
    const { socket, isConnected } = useWebSocket()

    useEffect(() => {
        setRequests(initialRequests)
    }, [initialRequests])

    useEffect(() => {
        if (!socket || !isConnected) return
        socket.emit('join', webhookId)
        const handleNewRequest = (newRequest: Request) => {
            setRequests((prev) => [newRequest, ...prev])
        }
        socket.on('new-request', handleNewRequest)
        return () => {
            socket.emit('leave', webhookId)
            socket.off('new-request', handleNewRequest)
        }
    }, [socket, isConnected, webhookId])

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Connection status (Task 20.3) */}
            {!isConnected && (
                <div className="bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200 text-xs text-center py-1 shrink-0">
                    Connecting...
                </div>
            )}

            {/* Request list */}
            <div className="flex-1 overflow-y-auto">
                {requests.length === 0 ? (
                    // Task 10.7: Empty state
                    <div className="text-center p-8 text-zinc-500 dark:text-zinc-400">
                        <p className="text-sm font-medium">No requests yet</p>
                        <p className="text-xs mt-1 text-zinc-400 dark:text-zinc-500">Send a request to this webhook URL to see it here.</p>
                    </div>
                ) : (
                    requests.map((req) => {
                        const isSelected = selectedRequestId === req.id
                        const date = new Date(req.timestamp)

                        return (
                            <Link
                                key={req.id}
                                href={`/webhooks/${webhookId}?requestId=${req.id}`}
                                className={`block p-4 border-b border-gray-100 dark:border-zinc-800 ${isSelected ? 'bg-blue-50 dark:bg-blue-900/30' : 'hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors'}`}
                                style={isSelected ? { borderLeftWidth: '4px', borderLeftColor: '#3b82f6', marginLeft: '-1px' } : undefined}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    {/* Task 15.7: Highlight method if method filter is active */}
                                    <span className={`px-2 py-0.5 text-xs font-bold rounded ${getMethodColor(req.method)}`}>
                                        {req.method}
                                    </span>
                                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                                        {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                                    </span>
                                </div>
                                <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                                    {date.toLocaleDateString()}
                                </div>
                                <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
                                    {req.sourceIp}
                                </div>
                            </Link>
                        )
                    })
                )}
            </div>
        </div>
    )
}

function getMethodColor(method: string) {
    switch (method.toUpperCase()) {
        case 'GET': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
        case 'POST': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        case 'PUT': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
        case 'DELETE': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        case 'PATCH': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
}
