import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockWebhooks = [
    { id: '1', token: 'webhook-1', name: 'First Webhook', ownerId: 'user-1', isEnabled: true, createdAt: new Date() },
    { id: '2', token: 'webhook-2', name: 'Second Webhook', ownerId: 'user-1', isEnabled: true, createdAt: new Date() },
    { id: '3', token: 'webhook-3', name: 'Third Webhook', ownerId: 'user-1', isEnabled: false, createdAt: new Date() },
    { id: '4', token: 'webhook-4', name: 'Fourth Webhook', ownerId: 'user-1', isEnabled: true, createdAt: new Date() },
    { id: '5', token: 'webhook-5', name: 'Fifth Webhook', ownerId: 'user-1', isEnabled: true, createdAt: new Date() },
    { id: '6', token: 'webhook-6', name: 'Sixth Webhook', ownerId: 'user-1', isEnabled: true, createdAt: new Date() },
    { id: '7', token: 'webhook-7', name: 'Seventh Webhook', ownerId: 'user-1', isEnabled: true, createdAt: new Date() },
    { id: '8', token: 'webhook-8', name: 'Eighth Webhook', ownerId: 'user-1', isEnabled: true, createdAt: new Date() },
    { id: '9', token: 'webhook-9', name: 'Ninth Webhook', ownerId: 'user-1', isEnabled: true, createdAt: new Date() },
    { id: '10', token: 'webhook-10', name: 'Tenth Webhook', ownerId: 'user-1', isEnabled: true, createdAt: new Date() },
    { id: '11', token: 'webhook-11', name: 'Eleventh Webhook', ownerId: 'user-1', isEnabled: true, createdAt: new Date() },
]

describe('Dashboard Search API', () => {
    let originalFetch: typeof fetch

    beforeEach(() => {
        originalFetch = global.fetch
    })

    afterEach(() => {
        global.fetch = originalFetch
    })

    it('fetches webhooks without search parameters', async () => {
        const mockResponse = {
            webhooks: mockWebhooks.slice(0, 10),
            pagination: { page: 1, limit: 10, total: 11, totalPages: 2 }
        }
        
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockResponse
        })

        const response = await fetch('/api/webhooks')
        const data = await response.json()

        expect(data.webhooks).toHaveLength(10)
        expect(data.pagination.total).toBe(11)
    })

    it('fetches webhooks with search parameter', async () => {
        const mockResponse = {
            webhooks: [mockWebhooks[0]],
            pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
        }
        
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockResponse
        })

        const response = await fetch('/api/webhooks?search=First')
        const data = await response.json()

        expect(data.webhooks).toHaveLength(1)
        expect(data.webhooks[0].name).toBe('First Webhook')
    })

    it('fetches webhooks with pagination', async () => {
        const mockResponse = {
            webhooks: [mockWebhooks[10]],
            pagination: { page: 2, limit: 10, total: 11, totalPages: 2 }
        }
        
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockResponse
        })

        const response = await fetch('/api/webhooks?page=2&limit=10')
        const data = await response.json()

        expect(data.pagination.page).toBe(2)
        expect(data.webhooks).toHaveLength(1)
    })

    it('fetches webhooks with search and pagination combined', async () => {
        const mockResponse = {
            webhooks: [mockWebhooks[1]],
            pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
        }
        
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockResponse
        })

        const response = await fetch('/api/webhooks?search=Second&page=1&limit=10')
        const data = await response.json()

        expect(data.webhooks).toHaveLength(1)
        expect(data.webhooks[0].name).toBe('Second Webhook')
        expect(data.pagination.total).toBe(1)
    })

    it('returns empty array when no webhooks match search', async () => {
        const mockResponse = {
            webhooks: [],
            pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
        }
        
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => mockResponse
        })

        const response = await fetch('/api/webhooks?search=nonexistent')
        const data = await response.json()

        expect(data.webhooks).toHaveLength(0)
        expect(data.pagination.total).toBe(0)
    })
})
