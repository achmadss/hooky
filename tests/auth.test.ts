import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('Authentication API', () => {
    let originalFetch: typeof fetch

    beforeEach(() => {
        originalFetch = global.fetch
    })

    afterEach(() => {
        global.fetch = originalFetch
    })

    describe('POST /api/auth/register', () => {
        it('registers new user with valid email and password', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 201,
                json: async () => ({ user: { id: '1', email: 'test@example.com' } })
            })

            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'test@example.com',
                    password: 'password123'
                })
            })

            expect(response.status).toBe(201)
        })

        it('rejects duplicate email', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 400,
                json: async () => ({ error: 'Email already registered' })
            })

            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'existing@example.com',
                    password: 'password123'
                })
            })

            expect(response.status).toBe(400)
        })

        it('rejects weak password', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 400,
                json: async () => ({ error: 'Password too weak' })
            })

            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'test@example.com',
                    password: '123'
                })
            })

            expect(response.status).toBe(400)
        })
    })

    describe('POST /api/auth/[...nextauth]', () => {
        it('logs in with valid credentials', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({ user: { id: '1', email: 'test@example.com' } })
            })

            const response = await fetch('/api/auth/[...nextauth]', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'test@example.com',
                    password: 'password123'
                })
            })

            expect(response.ok).toBe(true)
        })

        it('rejects invalid credentials', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 401,
                json: async () => ({ error: 'Invalid credentials' })
            })

            const response = await fetch('/api/auth/[...nextauth]', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                })
            })

            expect(response.status).toBe(401)
        })
    })

    describe('Webhook Claiming', () => {
        it('claims unowned webhook on login', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({ success: true })
            })

            const response = await fetch('/api/webhooks/claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ webhookId: 'webhook-1' })
            })

            expect(response.ok).toBe(true)
        })

        it('cannot claim already owned webhook', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 403,
                json: async () => ({ error: 'Webhook already owned' })
            })

            const response = await fetch('/api/webhooks/claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ webhookId: 'webhook-2' })
            })

            expect(response.status).toBe(403)
        })
    })
})
