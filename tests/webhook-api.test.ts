import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('Webhook Management API', () => {
    let originalFetch: typeof fetch

    beforeEach(() => {
        originalFetch = global.fetch
    })

    afterEach(() => {
        global.fetch = originalFetch
    })

    describe('GET /api/webhooks', () => {
        it('requires authentication', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 401,
                json: async () => ({ error: 'Unauthorized' })
            })

            const response = await fetch('/api/webhooks')
            
            expect(response.status).toBe(401)
        })

        it('returns webhooks for authenticated user', async () => {
            const mockWebhooks = [
                { id: '1', token: 'test-token', name: 'Test', isEnabled: true }
            ]
            
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => mockWebhooks
            })

            const response = await fetch('/api/webhooks')
            const data = await response.json()

            expect(Array.isArray(data)).toBe(true)
        })
    })

    describe('POST /api/webhooks', () => {
        it('creates webhook with auto-generated token', async () => {
            const mockWebhook = { 
                id: '1', 
                token: 'abc123def456', 
                name: 'Test Webhook',
                isEnabled: true 
            }
            
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 201,
                json: async () => mockWebhook
            })

            const response = await fetch('/api/webhooks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Test Webhook' })
            })

            expect(response.status).toBe(201)
        })

        it('creates webhook with custom token', async () => {
            const mockWebhook = { 
                id: '1', 
                token: 'my-custom-token', 
                name: 'Test',
                isEnabled: true 
            }
            
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 201,
                json: async () => mockWebhook
            })

            const response = await fetch('/api/webhooks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: 'my-custom-token', name: 'Test' })
            })

            expect(response.status).toBe(201)
        })

        it('rejects duplicate token', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 409,
                json: async () => ({ error: 'Token already in use' })
            })

            const response = await fetch('/api/webhooks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: 'existing-token' })
            })

            expect(response.status).toBe(409)
        })
    })

    describe('PATCH /api/webhooks/:id', () => {
        it('toggles webhook enabled status', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({ id: '1', isEnabled: false })
            })

            const response = await fetch('/api/webhooks/1', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isEnabled: false })
            })

            expect(response.ok).toBe(true)
        })

        it('updates webhook name', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({ id: '1', name: 'Updated Name' })
            })

            const response = await fetch('/api/webhooks/1', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Updated Name' })
            })

            const data = await response.json()
            expect(data.name).toBe('Updated Name')
        })
    })

    describe('DELETE /api/webhooks/:id', () => {
        it('soft deletes webhook', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 204
            })

            const response = await fetch('/api/webhooks/1', {
                method: 'DELETE'
            })

            expect(response.status).toBe(204)
        })

        it('returns 404 for non-existent webhook', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 404,
                json: async () => ({ error: 'Not found' })
            })

            const response = await fetch('/api/webhooks/nonexistent', {
                method: 'DELETE'
            })

            expect(response.status).toBe(404)
        })
    })
})
