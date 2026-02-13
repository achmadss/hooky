import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// Task 21.3: Date/time formatting utilities
export function formatRelativeTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    const now = Date.now()
    const diff = now - d.getTime()
    const secs = Math.floor(diff / 1000)
    if (secs < 60) return `${secs}s ago`
    const mins = Math.floor(secs / 60)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    return `${days}d ago`
}

export function formatDateTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'medium' })
}

// Task 21.4: IP address parsing utility (handle IPv4/IPv6, strip port, normalize ::ffff: prefix)
export function parseIpAddress(ip: string | null | undefined): string {
    if (!ip) return 'Unknown'
    // Strip IPv4-mapped IPv6 prefix (::ffff:x.x.x.x)
    const mapped = ip.replace(/^::ffff:/i, '')
    // Strip port from IPv4 (x.x.x.x:port)
    const withoutPort = mapped.replace(/:\d+$/, '')
    return withoutPort || ip
}

// Task 21.5: Request body size detection (returns human-readable size)
export function formatBodySize(body: string | null | undefined): string {
    if (!body) return '0 B'
    const bytes = new TextEncoder().encode(body).length
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export const HTTP_STATUS_CODES: { value: number; label: string }[] = [
    { value: 100, label: '100 Continue' },
    { value: 101, label: '101 Switching Protocols' },
    { value: 102, label: '102 Processing' },
    { value: 200, label: '200 OK' },
    { value: 201, label: '201 Created' },
    { value: 202, label: '202 Accepted' },
    { value: 203, label: '203 Non-Authoritative Information' },
    { value: 204, label: '204 No Content' },
    { value: 205, label: '205 Reset Content' },
    { value: 206, label: '206 Partial Content' },
    { value: 207, label: '207 Multi-Status' },
    { value: 208, label: '208 Already Reported' },
    { value: 226, label: '226 IM Used' },
    { value: 300, label: '300 Multiple Choices' },
    { value: 301, label: '301 Moved Permanently' },
    { value: 302, label: '302 Found' },
    { value: 303, label: '303 See Other' },
    { value: 304, label: '304 Not Modified' },
    { value: 305, label: '305 Use Proxy' },
    { value: 307, label: '307 Temporary Redirect' },
    { value: 308, label: '308 Permanent Redirect' },
    { value: 400, label: '400 Bad Request' },
    { value: 401, label: '401 Unauthorized' },
    { value: 402, label: '402 Payment Required' },
    { value: 403, label: '403 Forbidden' },
    { value: 404, label: '404 Not Found' },
    { value: 405, label: '405 Method Not Allowed' },
    { value: 406, label: '406 Not Acceptable' },
    { value: 407, label: '407 Proxy Authentication Required' },
    { value: 408, label: '408 Request Timeout' },
    { value: 409, label: '409 Conflict' },
    { value: 410, label: '410 Gone' },
    { value: 411, label: '411 Length Required' },
    { value: 412, label: '412 Precondition Failed' },
    { value: 413, label: '413 Payload Too Large' },
    { value: 414, label: '414 URI Too Long' },
    { value: 415, label: '415 Unsupported Media Type' },
    { value: 416, label: '416 Range Not Satisfiable' },
    { value: 417, label: '417 Expectation Failed' },
    { value: 418, label: "418 I'm a teapot" },
    { value: 421, label: '421 Misdirected Request' },
    { value: 422, label: '422 Unprocessable Entity' },
    { value: 423, label: '424 Failed Dependency' },
    { value: 425, label: '425 Too Early' },
    { value: 426, label: '426 Upgrade Required' },
    { value: 428, label: '428 Precondition Required' },
    { value: 429, label: '429 Too Many Requests' },
    { value: 431, label: '431 Request Header Fields Too Large' },
    { value: 451, label: '451 Unavailable For Legal Reasons' },
    { value: 500, label: '500 Internal Server Error' },
    { value: 501, label: '501 Not Implemented' },
    { value: 502, label: '502 Bad Gateway' },
    { value: 503, label: '503 Service Unavailable' },
    { value: 504, label: '504 Gateway Timeout' },
    { value: 505, label: '505 HTTP Version Not Supported' },
    { value: 506, label: '506 Variant Also Negotiates' },
    { value: 507, label: '507 Insufficient Storage' },
    { value: 508, label: '508 Loop Detected' },
    { value: 510, label: '510 Not Extended' },
    { value: 511, label: '511 Network Authentication Required' },
    { value: 599, label: '599 Network Connect Timeout Error' },
]

export type ContentType = 'application/json' | 'application/xml' | 'text/plain' | 'text/html'

export const CONTENT_TYPES: { value: ContentType; label: string }[] = [
    { value: 'application/json', label: 'JSON' },
    { value: 'application/xml', label: 'XML' },
    { value: 'text/plain', label: 'Plain text' },
    { value: 'text/html', label: 'HTML' },
]

export function getMonacoLanguage(contentType: ContentType): string {
    switch (contentType) {
        case 'application/json':
            return 'json'
        case 'application/xml':
            return 'xml'
        case 'text/html':
            return 'html'
        default:
            return 'plaintext'
    }
}

