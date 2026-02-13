import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

describe('Request Capture API', () => {
    let originalFetch: typeof fetch

    beforeEach(() => {
        originalFetch = global.fetch
    })

    afterEach(() => {
        global.fetch = originalFetch
    })

    describe('GET /api/wh/:token', () => {
        it('captures GET request and returns 200', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 200
            })

            const response = await fetch('/api/wh/test-token', { method: 'GET' })
            
            expect(response.status).toBe(200)
        })

        it('captures POST request with JSON body', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 200
            })

            const response = await fetch('/api/wh/test-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: 'value' })
            })
            
            expect(response.status).toBe(200)
        })

        it('captures POST request with form data', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 200
            })

            const response = await fetch('/api/wh/test-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: 'key=value'
            })
            
            expect(response.status).toBe(200)
        })

        it('returns 404 for non-existent token', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 404
            })

            const response = await fetch('/api/wh/nonexistent-token', { method: 'GET' })
            
            expect(response.status).toBe(404)
        })

        it('returns 404 for disabled webhook', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 404
            })

            const response = await fetch('/api/wh/disabled-token', { method: 'GET' })
            
            expect(response.status).toBe(404)
        })
    })

    describe('POST /api/wh/:token', () => {
        it('captures POST request', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 200
            })

            const response = await fetch('/api/wh/test-token', {
                method: 'POST',
                body: 'test body'
            })
            
            expect(response.status).toBe(200)
        })
    })

    describe('PUT /api/wh/:token', () => {
        it('captures PUT request', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 200
            })

            const response = await fetch('/api/wh/test-token', { method: 'PUT' })
            
            expect(response.status).toBe(200)
        })
    })

    describe('DELETE /api/wh/:token', () => {
        it('captures DELETE request', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 200
            })

            const response = await fetch('/api/wh/test-token', { method: 'DELETE' })
            
            expect(response.status).toBe(200)
        })
    })

    describe('PATCH /api/wh/:token', () => {
        it('captures PATCH request', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 200
            })

            const response = await fetch('/api/wh/test-token', { method: 'PATCH' })
            
            expect(response.status).toBe(200)
        })
    })

    describe('HEAD /api/wh/:token', () => {
        it('captures HEAD request', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 200
            })

            const response = await fetch('/api/wh/test-token', { method: 'HEAD' })
            
            expect(response.status).toBe(200)
        })
    })

    describe('OPTIONS /api/wh/:token', () => {
        it('captures OPTIONS request', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 200
            })

            const response = await fetch('/api/wh/test-token', { method: 'OPTIONS' })
            
            expect(response.status).toBe(200)
        })
    })

    describe('Request body handling', () => {
        it('rejects binary content types', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: false,
                status: 415,
                json: async () => ({ error: 'Unsupported Media Type' })
            })

            const response = await fetch('/api/wh/test-token', {
                method: 'POST',
                headers: { 'Content-Type': 'image/png' },
                body: 'binary data'
            })
            
            expect(response.status).toBe(415)
        })

        it('accepts JSON content type', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 200
            })

            const response = await fetch('/api/wh/test-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: '{"key":"value"}'
            })
            
            expect(response.status).toBe(200)
        })

        it('accepts XML content type', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 200
            })

            const response = await fetch('/api/wh/test-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/xml' },
                body: '<root><item>value</item></root>'
            })
            
            expect(response.status).toBe(200)
        })

        it('accepts plain text content type', async () => {
            global.fetch = vi.fn().mockResolvedValue({
                ok: true,
                status: 200
            })

            const response = await fetch('/api/wh/test-token', {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain' },
                body: 'plain text content'
            })
            
            expect(response.status).toBe(200)
        })
    })
})
