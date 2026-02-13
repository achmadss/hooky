# Proposal: Hooky - Webhook Mock and Inspection Tool

## Why

Developers building integrations that rely on webhooks need a simple way to generate temporary endpoints and inspect incoming HTTP requests in real-time. Existing solutions are either too complex, require account creation, or lack real-time visibility. Hooky provides a lightweight, self-hosted solution that makes webhook debugging and testing effortless.

## What Changes

This change introduces a complete webhook mock and inspection system:

- **Webhook Management**: Create and manage webhook endpoints with auto-generated or custom tokens, enable/disable webhooks
- **Request Capture**: Capture all HTTP methods (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS) with full request details
- **Real-Time Inspection**: View incoming requests in real-time via WebSocket connection
- **Custom Responses**: Configure per-webhook HTTP responses (status code, headers, body)
- **Anonymous/Guest Mode**: Instant webhook creation - anonymous users visiting homepage are auto-redirected to a new webhook detail page with request inspection only (no management features)
- **Authentication**: User accounts with full webhook management dashboard (create, list, update, soft-delete) and persistent storage (no auto-cleanup)
- **Webhook Claiming**: Anonymous users can claim their auto-created webhook when logging in
- **Soft-Delete Architecture**: All deletions are soft-deletes (mark as deleted, not actually removed). Includes requests cleanup for anonymous users (soft-delete after 7 days)
- **Web UI**: Interactive interface for creating webhooks, inspecting requests, and managing authentication
- **Docker Support**: Multi-container Docker setup with PostgreSQL for easy deployment

## Capabilities

### New Capabilities

- `webhook-management`: Create, list, and soft-delete webhook endpoints with unique tokens. Supports auto-generated random tokens and user-defined custom tokens with sanitization. Includes enable/disable functionality and ownership tracking. Full management dashboard available only to authenticated users. All deletions are soft-deletes.
- `request-capture`: Capture and store incoming HTTP requests including method, headers, query parameters, body, timestamp, source IP, and user agent. Implements automatic soft-delete cleanup for anonymous users (7-day retention). Disabled webhooks return 404 without capturing requests.
- `websocket-realtime`: Real-time request streaming to connected clients using WebSocket connections.
- `response-configuration`: Configure custom HTTP responses per webhook including status code, headers, and body with sensible defaults.
- `authentication`: Anonymous users are auto-redirected to newly created webhook detail page on homepage visit. Authenticated users see full management dashboard. Includes webhook claiming workflow when anonymous users log in.
- `request-inspector-ui`: Web interface for viewing captured requests with pretty-formatted payloads, raw view, and metadata exploration. Anonymous users see simplified UI without management features. Includes authentication UI and webhook claiming workflow.
- `dashboard-search`: Authenticated users can search and paginate through their webhooks from the dashboard. Supports filtering by token or name with server-side paging.
- `ui-notification`: Toast notification system for user feedback on actions like save, delete, copy, and errors.
- `webhook-detail-management`: Users can edit webhook details including name and description from the webhook detail page.

### Modified Capabilities

<!-- No existing capabilities are being modified - this is a new feature -->

## Impact

- **New Database Tables**: PostgreSQL schema with tables for users, webhooks (with ownerId), requests, and response configurations
- **New API Routes**: RESTful endpoints for webhook management, request capture, and authentication
- **WebSocket Server**: Real-time communication infrastructure
- **New UI Components**: React components for webhook management, request inspection, authentication, and webhook claiming
- **Background Jobs**: Scheduled soft-delete cleanup job for anonymous webhook requests (7-day retention)
- **Docker Configuration**: Multi-container setup with Next.js app and PostgreSQL
- **Dependencies**: WebSocket library, PostgreSQL client, ORM (Prisma), authentication library (NextAuth.js or similar)
