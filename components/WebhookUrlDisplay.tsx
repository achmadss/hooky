'use client'

import { useEffect, useState } from 'react'

interface WebhookUrlDisplayProps {
    token: string
    className?: string
}

export default function WebhookUrlDisplay({ token, className = '' }: WebhookUrlDisplayProps) {
    const [origin, setOrigin] = useState('')

    useEffect(() => {
        setOrigin(window.location.origin)
    }, [])

    const url = `${origin}/api/wh/${token}`

    return (
        <div className={`flex items-center gap-2 w-full ${className}`}>
            <div className="relative flex-1 group">
                <input
                    type="text"
                    readOnly
                    value={origin ? url : 'Loading...'}
                    className="block w-full pl-3 pr-3 py-1.5 text-sm text-gray-600 bg-gray-50 dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-700 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-right"
                    onClick={(e) => e.currentTarget.select()}
                />
            </div>
        </div>
    )
}
