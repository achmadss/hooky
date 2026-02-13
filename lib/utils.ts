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

