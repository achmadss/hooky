'use client'

import { Check, Copy } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useToast } from '@/components/ToastContext'

interface WebhookUrlDisplayProps {
    token: string
    className?: string
}

export default function WebhookUrlDisplay({ token, className = '' }: WebhookUrlDisplayProps) {
    const [copied, setCopied] = useState(false)
    const [origin, setOrigin] = useState('')
    const { showToast } = useToast()

    useEffect(() => {
        setOrigin(window.location.origin)
    }, [])

    const url = `${origin}/api/wh/${token}`

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url)
            setCopied(true)
            showToast('Webhook URL copied to clipboard', 'success')
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy specific text', err)
            showToast('Failed to copy URL', 'error')
        }
    }

    return (
        <div className={`flex items-center gap-2 w-full ${className}`}>
            <div className="relative flex-1 group">
                <input
                    type="text"
                    readOnly
                    value={origin ? url : 'Loading...'}
                    className="block w-full pr-10 pl-3 py-1.5 text-sm text-gray-600 bg-gray-50 dark:bg-zinc-800 dark:text-gray-300 dark:border-zinc-700 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 font-mono text-ellipsis"
                    onClick={(e) => e.currentTarget.select()}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-1">
                    <button
                        onClick={handleCopy}
                        className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-500 transition-colors"
                        title="Copy to clipboard"
                        type="button"
                    >
                        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                </div>
            </div>
        </div>
    )
}
