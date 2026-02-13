# Design: Hooky - Webhook Mock and Inspection Tool

## Context

Hooky is a new webhook mock and inspection tool designed to simplify debugging, testing, and development of webhook-based integrations. The project will be built as a Next.js application using API routes for request handling and WebSocket for real-time updates. It will use PostgreSQL for data persistence and be containerized with Docker for easy deployment.

**Current State:**
- Fresh Next.js project initialized
- PostgreSQL database to be configured
- WebSocket infrastructure to be implemented
- UI components to be built

**Constraints:**
- Must use Next.js API routes for simplicity
- Must support real-time request updates via WebSocket
- Must support custom webhook tokens with sanitization
- Must be containerized with Docker
- Must support anonymous/guest mode with auto-redirect to newly created webhook
- Must implement automatic cleanup for anonymous users (7-day retention)
- Must support webhook claiming workflow when anonymous users log in
- Must support enable/disable webhook endpoints
- Anonymous users cannot access webhook management dashboard (create, list, update, delete)

## Goals / Non-Goals

**Goals:**
- Enable developers to quickly create webhook endpoints with unique or custom tokens
- Capture and store complete HTTP request data (method, headers, query params, body, metadata)
- Provide real-time request streaming to connected clients via WebSocket
- Allow per-webhook custom HTTP response configuration
- Offer an intuitive web UI for webhook management and request inspection
- Support all standard HTTP methods
- Provide sensible defaults (empty 200 response) for minimal configuration
- Support instant webhook creation for anonymous users - auto-redirect to new webhook detail page on homepage visit
- Implement automatic cleanup for anonymous users (requests deleted after 7 days)
- Support user authentication for full webhook management dashboard and persistent storage
- Enable webhook claiming workflow when anonymous users log in
- Support enable/disable webhook endpoints
- Restrict management features (create, list, update, delete) to authenticated users only

**Non-Goals:**
- Rate limiting (not required initially)
- Authentication/authorization for webhook endpoints (capture endpoints remain open)
- Request replay/re-send functionality
- IP geolocation/country detection
- Request persistence beyond database storage (no export functionality initially)
- Webhook sharing between users
- Role-based access control (RBAC)
- Team/organization support

## Decisions

### 1. Technology Stack

**Decision:** Use Next.js 15+ with App Router, PostgreSQL, and Socket.io for WebSocket

**Rationale:**
- Next.js provides a unified codebase for frontend and API routes
- App Router supports API routes and server components efficiently
- PostgreSQL offers reliable ACID-compliant storage with good JSON support
- Socket.io provides robust WebSocket handling with fallback options and room-based broadcasting

**Alternatives Considered:**
- Fastify/Express separate backend: More complex, requires separate deployment
- SQLite: Not suitable for concurrent writes and WebSocket connections
- Native WebSocket: Socket.io provides better reliability and room management

### 2. Database ORM

**Decision:** Use Prisma ORM

**Rationale:**
- Excellent TypeScript support with generated types
- Migration system for schema evolution
- Intuitive query API
- Good PostgreSQL integration

**Alternatives Considered:**
- Drizzle: Lighter but newer, smaller ecosystem
- Raw SQL: More control but more boilerplate

### 3. Token Generation Strategy

**Decision:** Use 16-character alphanumeric random tokens by default, with optional custom tokens

**Rationale:**
- 16 characters provides ~7.9e28 combinations - secure against guessing
- Alphanumeric keeps URLs clean and easy to share
- Custom tokens allow memorable/descriptive URLs

**Token Sanitization Rules:**
- Only alphanumeric characters (a-z, A-Z, 0-9) allowed
- Spaces converted to dashes
- All characters lowercased for consistency
- Must be unique across all webhooks
- Minimum length: 3 characters
- Maximum length: 64 characters

### 4. WebSocket Architecture

**Decision:** Use Socket.io with room-based broadcasting per webhook

**Rationale:**
- Rooms allow targeted updates - clients only receive updates for webhooks they're viewing
- Reduces unnecessary network traffic
- Scales better than broadcasting to all clients

**Implementation:**
- Client joins room: `webhook:{webhookId}` when viewing a specific webhook
- Server broadcasts to room when new request arrives
- Auto-reconnect on disconnect with exponential backoff

### 5. Request Storage Strategy

**Decision:** Store full request data in PostgreSQL with JSON columns for headers and query params

**Rationale:**
- JSON columns allow flexible schema for headers/query params
- Full-text search can be added later if needed
- Body stored as text (may be JSON, XML, or plain text)

**Data Retention:**
- No automatic purging initially
- Can add retention policies later if storage becomes concern

**Request Body Limits:**
- Maximum size: 50 MB
- Type: Text only (JSON, XML, plain text, form data)
- Binary file uploads not supported in initial version

### 6. Response Configuration

**Decision:** Separate table for response configuration with default fallback

**Rationale:**
- Allows null values (use defaults) without cluttering webhook table
- Easy to extend with additional response options later
- Clear separation of concerns

**Default Response:**
- Status: 200 OK
- Headers: `Content-Type: text/plain`
- Body: empty string

### 7. Docker Architecture

**Decision:** Multi-container setup with Next.js app and PostgreSQL

**Rationale:**
- Separation of concerns
- PostgreSQL data persists in Docker volume
- Easy to scale or replace components independently

**Base Image:** node:20-alpine (lightweight, secure)

### 8. URL Structure

**Decision:** Use `/api/wh/{token}` for webhook capture endpoints

**Rationale:**
- Clear separation from management API (`/api/webhooks`)
- Short and memorable for sharing
- RESTful design

### 9. Authentication Strategy

**Decision:** Use NextAuth.js with credential-based authentication and optional anonymous mode

**Rationale:**
- NextAuth.js integrates seamlessly with Next.js App Router
- Supports multiple providers if needed in the future
- Handles sessions and JWT tokens automatically
- Anonymous mode implemented via session cookies without login

**Anonymous Mode Implementation:**
- Generate anonymous session ID stored in HTTP-only cookie
- On homepage visit, automatically create a new webhook with random token
- Immediately redirect to `/webhooks/{id}` detail page
- Anonymous users see only the request inspector UI (no management features)
- Anonymous users cannot access `/` (dashboard) - redirected to their webhook
- Clear visual indicator in UI showing "Anonymous Mode - Requests auto-deleted after 7 days"

**Authenticated Mode Implementation:**
- Authenticated users visiting `/` see the full webhook management dashboard
- Can create, list, update, delete webhooks
- Can access any webhook they own via `/webhooks/{id}`
- Full access to all management features

**Authentication Flow:**
- Anonymous user visits homepage → auto-create webhook → redirect to webhook detail
- Anonymous user can register/login at any time from webhook detail page
- On login, check for webhooks associated with anonymous session
- Prompt user to claim the auto-created webhook
- Transfer ownership on confirmation
- After claiming, user can access full management dashboard at `/`

**Alternatives Considered:**
- JWT-only auth: More complex to implement session management
- Magic links: Good UX but adds email dependency
- OAuth providers: Good for production, adds complexity for self-hosted

### 10. Data Retention and Soft-Delete Cleanup

**Decision:** Implement soft-delete architecture for all deletions including cleanup job

**Rationale:**
- Data recovery: Accidentally deleted webhooks or requests can be restored
- Audit trail: Maintain history of all data for compliance/debugging
- Safer operations: No risk of permanent data loss
- Aligns with modern best practices for data management

**Implementation:**
- All tables have `deletedAt` timestamp field (null = not deleted)
- Daily scheduled job soft-deletes requests older than 7 days for anonymous webhooks
- Webhook deletion sets `deletedAt` timestamp
- All queries filter by `deletedAt IS NULL` by default
- Optionally add `isDeleted` boolean for faster indexing
- Log all soft-delete operations for monitoring

**Soft-Delete Rules:**
- Anonymous webhooks: Requests soft-deleted after 7 days (hidden from UI but recoverable)
- Anonymous sessions: Expire after 6 days (soft-delete happens on day 7)
- Authenticated webhooks: Soft-delete only (never hard-deleted)
- All deletions are soft-deletes by design
- Hard deletion only via manual admin intervention if ever needed

**Alternatives Considered:**
- Hard delete: Risk of permanent data loss, no recovery possible
- Delete entire webhook after 7 days: Too aggressive, loses configuration

### 11. Webhook Enable/Disable

**Decision:** Add `isEnabled` boolean flag to webhook model

**Rationale:**
- Simple to implement and understand
- Allows temporary deactivation without deletion
- When disabled, webhook returns 404 as if it doesn't exist
- Preserves all data and configuration while disabled

**Behavior:**
- Enabled webhook (default): Normal operation, captures requests, returns configured response
- Disabled webhook: Returns 404 Not Found, no request capture, no data stored
- Can be toggled via UI or API

**Use Cases:**
- Temporarily stop receiving webhooks without deleting configuration
- Prevent abuse or unwanted traffic
- Maintenance mode for integrations

### 12. UI Theming

**Decision:** Implement dark mode support with system preference detection

**Rationale:**
- Modern UI expectation
- Better user experience for developers who prefer dark themes
- Reduces eye strain during extended use
- System preference detection provides seamless experience

**Implementation:**
- Use Tailwind CSS dark mode classes
- Store user preference in localStorage
- Default to system preference
- Toggle switch in UI header
- All components must support both themes

### 13. Request Search and Filtering

**Decision:** Implement search and filtering for captured requests in the UI

**Rationale:**
- Helps users find specific requests quickly in high-traffic webhooks
- Improves debugging workflow
- Standard feature expected in webhook inspection tools

**Implementation:**
- Search by: HTTP method, headers, body content, source IP
- Filter by: Time range, HTTP method
- Real-time filtering as user types
- Clear filters button
- Search highlighting in results

### 14. Soft-Delete Architecture

**Decision:** Implement soft-delete for all entities (webhooks, requests, users)

**Rationale:**
- Data safety: No accidental permanent deletions
- Audit compliance: Full history maintained
- Recovery capability: Deleted data can be restored if needed
- User confidence: Users can delete without fear of irreversible loss

**Implementation:**
- All database tables include `deletedAt` timestamp field (nullable)
- Default value: `null` (not deleted)
- When deleted: Set `deletedAt` to current timestamp
- All queries include `WHERE deletedAt IS NULL` by default
- Optionally add `isDeleted` boolean for indexing performance
- Include Prisma middleware or query extensions for automatic filtering

**Entities with Soft-Delete:**
- **Webhooks**: Soft-deleted when user deletes; hidden from dashboard but recoverable
- **Requests**: Soft-deleted during cleanup; hidden from UI after 7 days for anonymous
- **Users**: Soft-deleted on account deletion; preserves webhook ownership history

**Query Patterns:**
- Standard queries: Filter out soft-deleted (`deletedAt IS NULL`)
- Admin queries: Can include soft-deleted for audit purposes
- Restore operation: Set `deletedAt` back to `null`

**Benefits:**
- Users can recover accidentally deleted webhooks
- Complete audit trail for compliance
- No data loss from bugs or user errors
- Easy to implement "Recently Deleted" feature later

### 15. Webhook Ownership and Claiming

**Decision:** Webhooks have optional ownerId (null for anonymous, userId for authenticated)

**Rationale:**
- Simple ownership model
- Anonymous users get one auto-created webhook with null ownerId
- Claiming transfers ownership by setting ownerId
- One-to-many relationship: User can own multiple webhooks

**Claim Workflow:**
1. Anonymous user visits homepage → system auto-creates webhook with random token
2. User is redirected to `/webhooks/{id}` detail page for the new webhook
3. User decides to log in/register from the detail page
4. System detects the auto-created webhook with matching anonymous session and null ownerId
5. UI prompts: "Add this webhook to your account for persistent storage?"
6. On confirmation, ownerId set to authenticated userId
7. Webhook now has persistent storage (no cleanup)
8. After claiming, user can access full management dashboard at `/`

**Edge Cases:**
- If webhook already has owner, cannot be claimed
- Multiple anonymous sessions cannot claim the same webhook
- User can decline claiming (webhooks remain anonymous)

### 16. User Flow and Homepage Behavior

**Decision:** Different homepage behavior for authenticated vs anonymous users

**Rationale:**
- Anonymous users want instant webhook without setup friction
- Authenticated users want to manage multiple webhooks
- Clear separation of concerns: inspection vs management
- Reduces cognitive load for quick webhook testing

**Anonymous User Flow:**
1. Visit `/` (homepage)
2. System checks: no authentication → create anonymous session
3. Generate random 16-char token
4. Create webhook with token (ownerId = null, sessionId = anonymousSessionId)
5. Redirect to `/webhooks/{webhookId}`
6. User sees request inspector UI only
7. UI shows: webhook URL, request list, request detail, response config
8. UI does NOT show: webhook list, create webhook button, delete webhook, enable/disable toggle
9. User can register/login from this page

**Authenticated User Flow:**
1. Visit `/` (homepage)
2. System checks: authenticated → show dashboard
3. Dashboard shows: list of all owned webhooks, create webhook button
4. User can click webhook to view detail at `/webhooks/{id}`
5. Full management features available: create, list, update, delete, enable/disable

**URL Access Control:**
- `/` (homepage):
  - Anonymous: Auto-create webhook → redirect to `/webhooks/{id}`
  - Authenticated: Show management dashboard
- `/webhooks/{id}`:
  - Anonymous: Accessible only if webhook belongs to their session
  - Authenticated: Accessible if webhook is owned by user
- `/api/webhooks` (list endpoint):
  - Anonymous: Return 403 Forbidden (no listing for anonymous)
  - Authenticated: Return owned webhooks

**Alternatives Considered:**
- Allow anonymous users to see dashboard but limit features: More complex, less clear UX
- Require login for everything: Adds friction for quick testing
- Show landing page with "Create Webhook" button for anonymous: Extra click, less instant

## Risks / Trade-offs

**Risk:** WebSocket connections may not scale well with very high request volumes
→ **Mitigation:** Room-based architecture limits traffic; can add Redis adapter for Socket.io if horizontal scaling needed

**Risk:** Large request bodies may impact database storage
→ **Mitigation:** Implemented 50MB request body size limit; returns 413 Payload Too Large for oversized requests

**Risk:** No authentication means anyone can create webhooks if instance is exposed
→ **Mitigation:** Anonymous mode with automatic cleanup prevents abuse; document for internal/dev use

**Risk:** PostgreSQL connection pool may be exhausted under high load
→ **Mitigation:** Configure connection pooling in Prisma; monitor and tune pool size

**Risk:** Anonymous session cookie could be lost, orphaning webhooks
→ **Mitigation:** Anonymous webhooks still accessible via direct URL; cleanup job handles orphaned data

**Risk:** Cleanup job might accidentally delete authenticated user data
→ **Mitigation:** Strict query filter: only delete where ownerId IS NULL; add audit logging

**Trade-off:** Using Next.js API routes limits flexibility compared to dedicated backend
→ **Acceptance:** Simplifies deployment and maintenance; acceptable for this use case

**Trade-off:** No rate limiting could lead to abuse
→ **Acceptance:** Designed for development/debugging; production use should add reverse proxy with rate limiting

**Trade-off:** 7-day retention might be too short for some use cases
→ **Acceptance:** Users can register to get persistent storage; retention period configurable via env var

**Trade-off:** Anonymous users cannot create custom tokens
→ **Acceptance:** Custom tokens are a management feature; anonymous users get instant random tokens

**Trade-off:** Anonymous users lose access to webhook if cookie is lost
→ **Acceptance:** Webhook accessible via direct URL; data subject to 7-day cleanup anyway

## Migration Plan

**Deployment Steps:**
1. Build Docker images
2. Run database migrations (`npx prisma migrate deploy`)
3. Start containers with `docker-compose up -d`

**Rollback Strategy:**
- Database migrations are reversible via Prisma
- Docker containers can be stopped and removed
- Data persists in Docker volume until explicitly removed

**Environment Variables:**
```
DATABASE_URL=postgresql://postgres:postgres@db:5432/hooky
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Authentication
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Optional: Anonymous retention period (days)
ANONYMOUS_RETENTION_DAYS=7

# Optional: Cleanup schedule (cron expression)
CLEANUP_SCHEDULE=0 0 * * *

# Optional: Maximum request body size in MB (default: 50)
MAX_REQUEST_BODY_SIZE_MB=50
```
