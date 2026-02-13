'use client'

import { useState, useEffect } from 'react'
import CodeEditor from './CodeEditor'
import { HTTP_STATUS_CODES, CONTENT_TYPES, type ContentType } from '@/lib/utils'

interface ResponseConfig {
    statusCode: number
    headers: Record<string, string>
    body: string | null
    contentType: string
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
    const [contentType, setContentType] = useState<ContentType>('application/json')
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)

    useEffect(() => {
        if (!isOwner) return
        fetch(`/api/webhooks/${webhookId}/response`)
            .then((r) => r.json())
            .then((data: ResponseConfig) => {
                setStatusCode(data.statusCode)
                setBody(data.body ?? '')
                setContentType((data.contentType as ContentType) || 'application/json')
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

    function handleFormat() {
        if (contentType === 'text/plain') {
            setMessage({ type: 'error', text: 'Plain text cannot be formatted' })
            return
        }

        try {
            if (contentType === 'application/json') {
                const formatted = JSON.stringify(JSON.parse(body), null, 2)
                setBody(formatted)
                setMessage({ type: 'success', text: 'Formatted successfully' })
            } else if (contentType === 'application/xml') {
                const formatted = formatXml(body)
                setBody(formatted)
                setMessage({ type: 'success', text: 'Formatted successfully' })
            } else if (contentType === 'text/html') {
                const formatted = formatHtml(body)
                setBody(formatted)
                setMessage({ type: 'success', text: 'Formatted successfully' })
            }
        } catch {
            setMessage({ type: 'error', text: `Invalid ${contentType.split('/')[1]} - could not format` })
        }
    }

    function formatXml(xml: string): string {
        let formatted = ''
        let indent = 0
        const lines = xml.replace(/>\s*</g, '><').split('')
        
        for (let i = 0; i < lines.length; i++) {
            const char = lines[i]
            
            if (char === '<') {
                if (lines[i + 1] === '/') {
                    indent = Math.max(0, indent - 1)
                }
                formatted += '\n' + '  '.repeat(indent) + '<'
            } else if (char === '>') {
                formatted += '>'
                if (lines[i + 1] && lines[i + 1] !== '<') {
                    if (lines[i + 1] === '/') {
                        indent = Math.max(0, indent - 1)
                    } else {
                        indent++
                    }
                }
            } else if (char !== '\n' && char !== '\r') {
                formatted += char
            }
        }
        
        return formatted.trim().split('\n').map((line, idx) => idx === 0 ? line : '  ' + line.trim()).join('\n')
    }

    function formatHtml(html: string): string {
        let formatted = ''
        let indent = 0
        let inTag = false
        let inContent = false
        
        for (let i = 0; i < html.length; i++) {
            const char = html[i]
            
            if (char === '<') {
                if (inContent && formatted.length > 0 && !formatted.endsWith('\n')) {
                    formatted += '\n' + '  '.repeat(indent)
                }
                inTag = true
                inContent = false
                
                if (html[i + 1] === '/') {
                    indent = Math.max(0, indent - 1)
                }
                
                formatted += '\n' + '  '.repeat(indent) + '<'
            } else if (char === '>') {
                formatted += '>'
                inTag = false
                
                const nextChars = html.slice(i + 1).trim()
                if (nextChars.startsWith('</')) {
                    indent = Math.max(0, indent - 1)
                } else if (!nextChars.startsWith('<') && nextChars.length > 0) {
                    inContent = true
                } else if (!nextChars.startsWith('</') && !nextChars.startsWith('<') && !nextChars.startsWith('!')) {
                    indent++
                }
            } else if (!inTag) {
                if (char === '\n' || char === '\r' || char === '\t') {
                    continue
                }
                if (inContent && char === ' ') {
                    continue
                }
                formatted += char
            } else {
                formatted += char
            }
        }
        
        return formatted.trim().split('\n').filter(line => line.trim()).join('\n')
    }

    // Task 12.5: Save functionality with API integration
    async function handleSave() {
        setLoading(true)
        setMessage(null)

        const headersObj = headers
            .filter((h) => h.key.trim())
            .reduce<Record<string, string>>((acc, h) => { acc[h.key.trim()] = h.value; return acc }, {})

        try {
            const res = await fetch(`/api/webhooks/${webhookId}/response`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ statusCode, headers: headersObj, body: body || null, contentType }),
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
            setContentType('application/json')
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
                <select
                    value={statusCode}
                    onChange={(e) => setStatusCode(parseInt(e.target.value))}
                    className="w-48 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {HTTP_STATUS_CODES.map((code) => (
                        <option key={code.value} value={code.value}>
                            {code.label}
                        </option>
                    ))}
                </select>
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

            {/* Content Type */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Content Type
                </label>
                <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value as ContentType)}
                    className="w-48 px-3 py-1.5 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    {CONTENT_TYPES.map((ct) => (
                        <option key={ct.value} value={ct.value}>
                            {ct.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* Response Body */}
            <div>
                <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Response Body
                    </label>
                    <button
                        type="button"
                        onClick={handleFormat}
                        className="text-xs px-2 py-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 border border-gray-300 dark:border-zinc-600 rounded hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors"
                    >
                        Format
                    </button>
                </div>
                <CodeEditor
                    value={body}
                    onChange={setBody}
                    contentType={contentType}
                    onFormat={handleFormat}
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
                    disabled={loading}
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
