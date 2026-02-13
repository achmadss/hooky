'use client'

import { useState, useEffect } from 'react'

interface ResponseConfig {
    statusCode: number
    headers: Record<string, string>
    body: string | null
    isDefault?: boolean
}

interface ResponseConfigPanelProps {
    webhookId: string
    isOwner: boolean
}

// Task 12.1: ResponseConfigPanel (visible only to authenticated webhook owners)
export default function ResponseConfigPanel({ webhookId, isOwner }: ResponseConfigPanelProps) {
    const [statusCode, setStatusCode] = useState(200)
    const [headers, setHeaders] = useState<{ key: string; value: string }[]>([{ key: '', value: '' }])
    const [body, setBody] = useState('')
    const [statusError, setStatusError] = useState<string | null>(null) // Task 12.2
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null) // Task 12.7
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)

    useEffect(() => {
        if (!isOwner) return
        fetch(`/api/webhooks/${webhookId}/response`)
            .then((r) => r.json())
            .then((data: ResponseConfig) => {
                setStatusCode(data.statusCode)
                setBody(data.body ?? '')
                const headerEntries = Object.entries(data.headers || {}).map(([k, v]) => ({ key: k, value: v }))
                setHeaders(headerEntries.length > 0 ? [...headerEntries, { key: '', value: '' }] : [{ key: '', value: '' }])
            })
            .finally(() => setFetching(false))
    }, [webhookId, isOwner])

    // Task 12.8: Hide panel for non-owners
    if (!isOwner) {
        // Task 12.9: Show read-only default response info
        return (
            <div className="p-6">
                <div className="bg-gray-50 dark:bg-zinc-800/50 rounded-lg border border-gray-200 dark:border-zinc-700 p-4">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Default Response</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        This webhook returns <span className="font-mono font-semibold text-gray-700 dark:text-gray-300">200 OK</span> with an empty body.
                        Claim this webhook to customize the response.
                    </p>
                </div>
            </div>
        )
    }

    // Task 12.2: Status code validation
    function validateStatusCode(val: number): string | null {
        if (isNaN(val) || val < 100 || val > 599) return 'Must be between 100 and 599'
        return null
    }

    function handleStatusCodeChange(val: string) {
        const num = parseInt(val)
        setStatusCode(num)
        setStatusError(validateStatusCode(num))
    }

    // Task 12.3: Headers editor - update a header row
    function updateHeader(index: number, field: 'key' | 'value', value: string) {
        const updated = [...headers]
        updated[index] = { ...updated[index], [field]: value }

        // Auto-add a new empty row when filling in the last row
        const isLast = index === updated.length - 1
        if (isLast && (updated[index].key || updated[index].value)) {
            updated.push({ key: '', value: '' })
        }

        setHeaders(updated)
    }

    function removeHeader(index: number) {
        setHeaders(headers.filter((_, i) => i !== index))
    }

    // Task 12.5: Save functionality with API integration
    async function handleSave() {
        const err = validateStatusCode(statusCode)
        if (err) { setStatusError(err); return }

        setLoading(true)
        setMessage(null)

        const headersObj = headers
            .filter((h) => h.key.trim())
            .reduce<Record<string, string>>((acc, h) => { acc[h.key.trim()] = h.value; return acc }, {})

        try {
            const res = await fetch(`/api/webhooks/${webhookId}/response`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ statusCode, headers: headersObj, body: body || null }),
            })
            if (res.ok) {
                setMessage({ type: 'success', text: 'Response configuration saved' })
            } else {
                const data = await res.json()
                setMessage({ type: 'error', text: data.error || 'Failed to save' })
            }
        } catch {
            setMessage({ type: 'error', text: 'Network error' })
        } finally {
            setLoading(false)
        }
    }

    // Task 12.6: Reset to defaults
    async function handleReset() {
        setLoading(true)
        setMessage(null)
        try {
            await fetch(`/api/webhooks/${webhookId}/response`, { method: 'DELETE' })
            setStatusCode(200)
            setHeaders([{ key: '', value: '' }])
            setBody('')
            setMessage({ type: 'success', text: 'Reset to defaults' })
        } catch {
            setMessage({ type: 'error', text: 'Failed to reset' })
        } finally {
            setLoading(false)
        }
    }

    if (fetching) {
        return <div className="p-6 text-sm text-gray-400">Loading...</div>
    }

    return (
        <div className="p-6 space-y-6">
            {/* Status Code */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status Code
                </label>
                <input
                    type="number"
                    value={statusCode}
                    onChange={(e) => handleStatusCodeChange(e.target.value)}
                    min={100}
                    max={599}
                    className="w-32 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {statusError && <p className="text-xs text-red-500 mt-1">{statusError}</p>}
            </div>

            {/* Headers Editor */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Response Headers
                </label>
                <div className="space-y-2">
                    {headers.map((h, i) => (
                        <div key={i} className="flex gap-2">
                            <input
                                type="text"
                                value={h.key}
                                onChange={(e) => updateHeader(i, 'key', e.target.value)}
                                placeholder="Header name"
                                className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <input
                                type="text"
                                value={h.value}
                                onChange={(e) => updateHeader(i, 'value', e.target.value)}
                                placeholder="Value"
                                className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            {headers.length > 1 && (
                                <button
                                    onClick={() => removeHeader(i)}
                                    className="px-2 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Response Body */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Response Body
                </label>
                <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Optional response body..."
                    rows={6}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
            </div>

            {/* Task 12.7: Success/error message */}
            {message && (
                <div className={`text-sm px-3 py-2 rounded-lg ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
                    {message.text}
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
                <button
                    onClick={handleSave}
                    disabled={loading || !!statusError}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                    onClick={handleReset}
                    disabled={loading}
                    className="px-4 py-2 bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-600 hover:bg-gray-50 dark:hover:bg-zinc-700 disabled:opacity-60 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors"
                >
                    Reset to Defaults
                </button>
            </div>
        </div>
    )
}
