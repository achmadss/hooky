'use client'

import { Request } from '@prisma/client'
import { useState } from 'react'

// Task 11.8: Copy-to-clipboard button helper
function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false)
    const handleCopy = async () => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
    }
    return (
        <button
            onClick={handleCopy}
            className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="Copy"
        >
            {copied ? (
                <svg className="w-3.5 h-3.5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
            ) : (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            )}
        </button>
    )
}

interface RequestDetailProps {
    request: Request
    webhookToken: string
}

export default function RequestDetail({ request, webhookToken }: RequestDetailProps) {
    const [activeTab, setActiveTab] = useState<'pretty' | 'raw' | 'headers' | 'query'>('pretty')

    const date = new Date(request.timestamp)

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden">
            {/* Task 11.1: Request Overview */}
            <div className="p-6 border-b border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-md text-base ${getMethodColor(request.method)}`}>
                                {request.method}
                            </span>
                            <span className="font-mono text-gray-500 text-lg">
                                /{webhookToken}
                            </span>
                        </h2>
                        <p className="text-sm text-gray-500 mt-2 flex gap-4">
                            <span>{date.toLocaleString()}</span>
                            <span>•</span>
                            <span className="font-mono">{request.sourceIp}</span>
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 border-b border-gray-200 dark:border-zinc-700 -mb-[25px]">
                    <TabButton active={activeTab === 'pretty'} onClick={() => setActiveTab('pretty')}>
                        Payload
                    </TabButton>
                    <TabButton active={activeTab === 'headers'} onClick={() => setActiveTab('headers')}>
                        Headers <span className="ml-1 text-xs bg-gray-200 dark:bg-zinc-700 px-1.5 rounded-full">{Object.keys(request.headers as object).length}</span>
                    </TabButton>
                    <TabButton active={activeTab === 'query'} onClick={() => setActiveTab('query')}>
                        Query Params <span className="ml-1 text-xs bg-gray-200 dark:bg-zinc-700 px-1.5 rounded-full">{Object.keys(request.queryParams as object).length}</span>
                    </TabButton>
                    <TabButton active={activeTab === 'raw'} onClick={() => setActiveTab('raw')}>
                        Raw
                    </TabButton>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                {activeTab === 'pretty' && (
                    <PrettyPayloadViewer body={request.body} headers={request.headers as Record<string, string>} />
                )}
                {activeTab === 'headers' && (
                    <HeadersExplorer headers={request.headers as Record<string, string>} />
                )}
                {activeTab === 'query' && (
                    <QueryParamsExplorer params={request.queryParams as Record<string, string>} />
                )}
                {activeTab === 'raw' && (
                    <RawRequestViewer request={request} webhookToken={webhookToken} />
                )}
            </div>
        </div>
    )
}

function TabButton({ active, children, onClick }: { active: boolean, children: React.ReactNode, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${active
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
        >
            {children}
        </button>
    )
}

// Task 11.3: Format XML with indentation
function formatXml(xml: string): string {
    let formatted = ''
    let indent = 0
    const lines = xml.replace(/></g, '>\n<').split('\n')
    for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed) continue
        if (trimmed.startsWith('</')) {
            indent = Math.max(0, indent - 1)
            formatted += '  '.repeat(indent) + trimmed + '\n'
        } else if (trimmed.endsWith('/>') || trimmed.startsWith('<?') || trimmed.startsWith('<!')) {
            formatted += '  '.repeat(indent) + trimmed + '\n'
        } else if (trimmed.startsWith('<') && !trimmed.startsWith('</')) {
            formatted += '  '.repeat(indent) + trimmed + '\n'
            if (!trimmed.includes('</') && !trimmed.endsWith('/>')) indent++
        } else {
            formatted += '  '.repeat(indent) + trimmed + '\n'
        }
    }
    return formatted.trim()
}

// Task 11.2 / 11.3: Pretty Payload Viewer (JSON/XML)
function PrettyPayloadViewer({ body, headers }: { body: string | null, headers: Record<string, string> }) {
    if (!body) {
        return <div className="text-gray-400 italic">No body content</div>
    }

    const contentType = (headers['content-type'] || '').toLowerCase()
    const isXml = contentType.includes('xml') || (body.trimStart().startsWith('<') && body.trimEnd().endsWith('>'))

    let content = body
    let format: 'json' | 'xml' | 'plain' = 'plain'

    // Task 11.3: XML formatting
    if (isXml) {
        try {
            content = formatXml(body)
            format = 'xml'
        } catch { /* keep as-is */ }
    } else {
        // Try JSON
        try {
            const parsed = JSON.parse(body)
            content = JSON.stringify(parsed, null, 2)
            format = 'json'
        } catch { /* Not JSON */ }
    }

    const colorClass = format === 'json'
        ? 'text-green-700 dark:text-green-400'
        : format === 'xml'
            ? 'text-blue-700 dark:text-blue-400'
            : 'text-gray-800 dark:text-gray-200'

    return (
        <div className="relative bg-gray-50 dark:bg-black/50 p-4 rounded-lg border border-gray-200 dark:border-zinc-800 font-mono text-sm overflow-x-auto">
            <div className="absolute top-2 right-2 flex items-center gap-1">
                {format !== 'plain' && (
                    <span className="text-xs text-gray-400 uppercase">{format}</span>
                )}
                <CopyButton text={content} />
            </div>
            <pre className={colorClass}>{content}</pre>
        </div>
    )
}

// Task 11.5 / 11.6: Headers Explorer with search/filter
function HeadersExplorer({ headers }: { headers: Record<string, string> }) {
    const [search, setSearch] = useState('')
    const allEntries = Object.entries(headers)

    // Task 11.6: Real-time header filtering
    const entries = search.trim()
        ? allEntries.filter(([k, v]) =>
            k.toLowerCase().includes(search.toLowerCase()) ||
            v.toLowerCase().includes(search.toLowerCase())
        )
        : allEntries

    if (allEntries.length === 0) {
        return <div className="text-gray-400 italic">No headers</div>
    }

    return (
        <div className="space-y-2">
            {/* Task 11.6: Search input */}
            <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search headers..."
                className="w-full px-3 py-1.5 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {entries.length === 0 ? (
                <div className="text-gray-400 italic text-sm">No matching headers</div>
            ) : (
                <div className="border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800 text-xs uppercase text-gray-500">
                            <tr>
                                <th className="px-4 py-2 font-medium w-1/3">Key</th>
                                <th className="px-4 py-2 font-medium">Value</th>
                                <th className="px-2 py-2 w-8"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                            {entries.map(([key, value]) => (
                                <tr key={key} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/20">
                                    <td className="px-4 py-2 font-mono text-gray-600 dark:text-gray-400 break-all">{key}</td>
                                    <td className="px-4 py-2 font-mono break-all">{value}</td>
                                    <td className="px-2 py-2"><CopyButton text={`${key}: ${value}`} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

// Task 11.7: Query Params Explorer
function QueryParamsExplorer({ params }: { params: Record<string, string> }) {
    const entries = Object.entries(params)

    if (entries.length === 0) {
        return <div className="text-gray-400 italic">No query parameters</div>
    }

    return (
        <div className="border border-gray-200 dark:border-zinc-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800 text-xs uppercase text-gray-500">
                    <tr>
                        <th className="px-4 py-2 font-medium w-1/3">Key</th>
                        <th className="px-4 py-2 font-medium">Value</th>
                        <th className="px-2 py-2 w-8"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-zinc-800">
                    {entries.map(([key, value]) => (
                        <tr key={key} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/20">
                            <td className="px-4 py-2 font-mono text-gray-600 dark:text-gray-400 break-all">{key}</td>
                            <td className="px-4 py-2 font-mono break-all">{value}</td>
                            <td className="px-2 py-2"><CopyButton text={value} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

// Task 11.4: Raw Request Viewer
function RawRequestViewer({ request, webhookToken }: { request: Request, webhookToken: string }) {
    const query = new URLSearchParams(request.queryParams as Record<string, string>).toString()
    // Add ? only if there are query params
    const path = query ? `?${query}` : ''

    return (
        <div className="bg-gray-900 text-gray-200 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <div className="mb-2 text-green-400">
                {request.method} /{webhookToken}{path} HTTP/1.1
            </div>
            {Object.entries(request.headers as Record<string, string>).map(([k, v]) => (
                <div key={k}>
                    <span className="text-blue-300">{k}:</span> {v}
                </div>
            ))}
            {request.body && (
                <>
                    <div className="my-2 text-gray-500 border-b border-gray-700"></div>
                    <pre className="text-white whitespace-pre-wrap break-all">{request.body}</pre>
                </>
            )}
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
