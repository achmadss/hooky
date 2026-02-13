# Tasks: Hooky Implementation

## 1. Project Setup and Database

- [ ] 1.1 Install required dependencies: Prisma, Socket.io, @socket.io/client, NextAuth.js
- [ ] 1.2 Initialize Prisma with PostgreSQL provider
- [ ] 1.3 Create database schema with User, Webhook, Request, and ResponseConfig models
- [ ] 1.4 Add User model with email, passwordHash, createdAt, deletedAt (nullable) fields
- [ ] 1.5 Add anonymous session support to Webhook model (ownerId nullable, sessionId)
- [ ] 1.6 Add isEnabled field to Webhook model (default: true)
- [ ] 1.7 Add deletedAt field (nullable) to all models: User, Webhook, Request, ResponseConfig
- [ ] 1.8 Add Prisma middleware for automatic soft-delete filtering
- [ ] 1.9 Create and run initial database migration
- [ ] 1.10 Set up environment variables (.env.example with DATABASE_URL, NEXTAUTH_SECRET)
- [ ] 1.11 Create database connection utility (lib/db/index.ts)

## 2. Authentication and Anonymous Session Setup

- [ ] 2.1 Configure NextAuth.js with credentials provider
- [ ] 2.2 Implement password hashing using bcrypt
- [ ] 2.3 Create anonymous session middleware with session ID generation
- [ ] 2.4 Implement session cookie handling (HTTP-only, Secure, SameSite)
- [ ] 2.5 Create auth context/provider for React
- [ ] 2.6 Implement auth guards for protected routes
- [ ] 2.7 Add NEXTAUTH_SECRET and NEXTAUTH_URL to environment variables
- [ ] 2.8 Implement anonymous session storage (cookie-based)
- [ ] 2.9 Create utility to check if user is anonymous vs authenticated
- [ ] 2.10 Implement anonymous session persistence across page reloads
- [ ] 2.11 Design auth system architecture for OAuth provider extensibility
- [ ] 2.12 Configure NextAuth.js to support multiple providers (for future OAuth)
- [ ] 2.13 Ensure user model can store provider-specific data without schema changes

## 3. Webhook Management API

- [ ] 3.1 Implement POST /api/webhooks - create webhook with auto-generated token (authenticated only)
- [ ] 3.2 Implement token generation utility (16-char alphanumeric random)
- [ ] 3.3 Implement token sanitization (lowercase, spaces to dashes, alphanumeric only)
- [ ] 3.4 Add validation for custom tokens (3-64 chars, unique check)
- [ ] 3.5 Implement GET /api/webhooks - list webhooks for authenticated user only (403 for anonymous)
- [ ] 3.6 Implement GET /api/webhooks/[id] - get single webhook details with ownership/session check
- [ ] 3.7 Implement PATCH /api/webhooks/[id] - update webhook (enable/disable, name) (authenticated only)
- [ ] 3.8 Implement DELETE /api/webhooks/[id] - soft-delete webhook and associated requests (authenticated only)
- [ ] 3.9 Implement GET /api/webhooks/unclaimed - get unclaimed webhook for claiming
- [ ] 3.10 Implement POST /api/webhooks/claim - claim ownership of anonymous webhook
- [ ] 3.11 Add authentication guards to restrict anonymous users from management endpoints
- [ ] 3.12 Implement ownership validation middleware for protected operations
- [ ] 3.13 Implement soft-delete middleware for Prisma queries (automatically filter deletedAt IS NULL)
- [ ] 3.14 Add global query extension to exclude soft-deleted records by default
- [ ] 3.15 Create utility function for soft-delete operations (set deletedAt timestamp)

## 4. Homepage Auto-Create and Redirect

- [ ] 4.1 Create homepage route handler (`/page.tsx`) with authentication check
- [ ] 4.2 Implement anonymous user detection on homepage visit
- [ ] 4.3 Implement auto-webhook creation for anonymous users (random token)
- [ ] 4.4 Implement redirect to `/webhooks/{id}` after auto-creation
- [ ] 4.5 Implement check for existing anonymous webhook on homepage revisit
- [ ] 4.6 Redirect existing anonymous users to their webhook detail page
- [ ] 4.7 Display management dashboard for authenticated users on homepage
- [ ] 4.8 Handle edge case: anonymous user with expired session visiting homepage

## 5. Request Capture API

- [ ] 5.1 Create catch-all API route /api/wh/[token]/route.ts for all HTTP methods
- [ ] 5.2 Implement request validation (check if webhook token exists and is enabled)
- [ ] 5.3 Implement request data extraction (method, headers, query params, body)
- [ ] 5.4 Implement metadata extraction (timestamp, source IP, user agent)
- [ ] 5.5 Implement request persistence to database
- [ ] 5.6 Return default 200 response for requests to valid enabled webhooks
- [ ] 5.7 Return 404 for disabled webhooks without capturing requests
- [ ] 5.8 Implement request body size limit (50 MB maximum)
- [ ] 5.9 Add MAX_REQUEST_BODY_SIZE_MB environment variable (default: 50)
- [ ] 5.10 Return 413 Payload Too Large for requests exceeding size limit
- [ ] 5.11 Implement text-based body handling (JSON, XML, plain text, form data)
- [ ] 5.12 Reject binary Content-Type requests with 415 Unsupported Media Type
- [ ] 5.13 Add check for binary Content-Type prefixes (image/, video/, audio/, application/octet-stream)
- [ ] 5.14 Ensure request queries filter out soft-deleted records (deletedAt IS NULL)

## 6. Response Configuration API

- [ ] 6.1 Implement GET /api/webhooks/[id]/response - get response config
- [ ] 6.2 Implement PUT /api/webhooks/[id]/response - update response config
- [ ] 6.3 Add validation for status code (100-599 range)
- [ ] 6.4 Implement DELETE /api/webhooks/[id]/response - reset to defaults
- [ ] 6.5 Update request capture to use custom response if configured
- [ ] 6.6 Return default response (200, text/plain, empty body) when no config exists

## 7. WebSocket Server

- [ ] 7.1 Set up Socket.io server in Next.js (socket.ts or similar)
- [ ] 7.2 Implement connection handling and connection ID assignment
- [ ] 7.3 Implement "join" event handler to add client to webhook room
- [ ] 7.4 Implement "leave" event handler to remove client from room
- [ ] 7.5 Implement request broadcasting to webhook rooms on new capture
- [ ] 7.6 Add connection status events (connected, disconnect, error)
- [ ] 7.7 Handle client disconnections and cleanup

## 8. Soft-Delete Cleanup Job

- [ ] 8.1 Implement cleanup job using node-cron or similar
- [ ] 8.2 Create soft-delete query to mark requests as deleted (set deletedAt) older than 7 days for anonymous webhooks
- [ ] 8.3 Set anonymous session cookie expiry to 6 days
- [ ] 8.4 Add logging for cleanup job activity (log number of soft-deleted records)
- [ ] 8.5 Schedule cleanup job to run daily at midnight UTC
- [ ] 8.6 Make retention period configurable via ANONYMOUS_RETENTION_DAYS env var (default: 7)
- [ ] 8.7 Make session expiry configurable via ANONYMOUS_SESSION_EXPIRY_DAYS env var (default: 6)
- [ ] 8.8 Add error handling and retry logic for cleanup failures
- [ ] 8.9 Ensure all queries filter out soft-deleted records by default

## 9. Webhook Management UI (Authenticated Only)

- [ ] 9.1 Create homepage dashboard for authenticated users showing ONLY owned webhooks
- [ ] 9.2 Implement CreateWebhookForm component with name and custom token inputs
- [ ] 9.3 Add live token preview with sanitization
- [ ] 9.4 Implement webhook list item with token, creation date, request count, and ownership badge
- [ ] 9.5 Add empty state for webhook list with CTA to create webhook
- [ ] 9.6 Implement webhook soft-deletion with confirmation dialog (authenticated only) - sets deletedAt timestamp
- [ ] 9.7 Add webhook enable/disable toggle with visual status indicator (authenticated only)
- [ ] 9.8 Show warning banner for disabled webhooks
- [ ] 9.9 Ensure anonymous users cannot see management UI elements (create, delete, enable/disable buttons)
- [ ] 9.10 Dashboard shows only owned webhooks (unclaimed anonymous webhooks NOT shown)

## 10. Request Inspector UI - Request List

- [ ] 10.1 Create webhook detail page at /webhooks/[id]/page.tsx
- [ ] 10.2 Implement RequestList component showing captured requests
- [ ] 10.3 Add request list item with method badge and timestamp
- [ ] 10.4 Implement WebSocket client connection and room joining
- [ ] 10.5 Add real-time request updates to the list
- [ ] 10.6 Implement request selection highlighting
- [ ] 10.7 Add empty state for request list with instructions
- [ ] 10.8 Show anonymous retention warning for unowned webhooks

## 11. Request Inspector UI - Request Detail

- [ ] 11.1 Create RequestDetail component with overview (method, timestamp, IP, user agent)
- [ ] 11.2 Implement PrettyPayloadViewer with JSON syntax highlighting
- [ ] 11.3 Add XML formatting support in payload viewer
- [ ] 11.4 Implement RawRequestViewer showing complete HTTP request
- [ ] 11.5 Create HeadersExplorer component with table view
- [ ] 11.6 Add header search/filter functionality
- [ ] 11.7 Create QueryParamsExplorer component
- [ ] 11.8 Implement copy-to-clipboard functionality for various fields

## 12. Response Configuration UI (Authenticated Only)

- [ ] 12.1 Create ResponseConfigPanel component (visible only to authenticated users who own the webhook)
- [ ] 12.2 Implement status code input with validation
- [ ] 12.3 Create headers editor (key-value pair input)
- [ ] 12.4 Add response body textarea
- [ ] 12.5 Implement save functionality with API integration
- [ ] 12.6 Add "Reset to Defaults" button
- [ ] 12.7 Show success/error messages on save
- [ ] 12.8 Hide Response Configuration tab for anonymous users
- [ ] 12.9 Show read-only default response info for anonymous users (200 OK)

## 13. Webhook Detail Page Layout

- [ ] 13.1 Create page layout with sidebar (request list) and main panel (request detail)
- [ ] 13.2 Display webhook URL prominently with copy button
- [ ] 13.3 Add tabs or sections for Request Inspector and Response Config
- [ ] 13.4 Implement responsive layout for mobile devices
- [ ] 13.5 Add back button to home page (only for authenticated users)
- [ ] 13.6 Handle 404 for non-existent webhooks
- [ ] 13.7 Add "Back to Dashboard" button for authenticated users
- [ ] 13.8 Hide dashboard navigation for anonymous users

## 14. Dark Mode Support

- [ ] 14.1 Configure Tailwind CSS for dark mode (darkMode: 'class')
- [ ] 14.2 Create ThemeProvider context for managing theme state
- [ ] 14.3 Implement system preference detection on initial load
- [ ] 14.4 Create dark mode toggle button in header
- [ ] 14.5 Store user theme preference in localStorage
- [ ] 14.6 Update all UI components to support dark mode classes
- [ ] 14.7 Implement dark mode styles for:
  - Background colors
  - Text colors
  - Border colors
  - Button styles
  - Input fields
  - Tables and lists
  - Sidebar and navigation
- [ ] 14.8 Update code/syntax highlighting for dark mode
- [ ] 14.9 Test all components in both light and dark modes

## 15. Request Search and Filtering UI

- [ ] 15.1 Create SearchFilterPanel component for request list
- [ ] 15.2 Implement search input with real-time filtering
- [ ] 15.3 Add search by HTTP method (GET, POST, PUT, etc.)
- [ ] 15.4 Add search by request body content
- [ ] 15.5 Add search by headers
- [ ] 15.6 Create time range filter dropdown (Last hour, 24 hours, 7 days, All time)
- [ ] 15.7 Implement search highlighting in results
- [ ] 15.8 Add search results count display
- [ ] 15.9 Create "Clear filters" button
- [ ] 15.10 Handle empty search results state
- [ ] 15.11 Optimize search performance for large request lists

## 16. Authentication UI

- [ ] 16.1 Create AuthModal component with login and registration forms
- [ ] 16.2 Implement form validation for email and password
- [ ] 16.3 Add error handling for auth failures
- [ ] 16.4 Create AuthButtons component for header (Sign Up/Log In or User menu)
- [ ] 16.5 Implement password visibility toggle
- [ ] 16.6 Add loading states for auth submissions
- [ ] 16.7 Create anonymous mode banner with retention warning
- [ ] 16.8 Add "Sign Up to Save" CTA button in anonymous banner

## 17. Webhook Claiming UI

- [ ] 17.1 Create WebhookClaimPrompt modal component
- [ ] 17.2 Implement detection of unclaimed webhook on login
- [ ] 17.3 Display claim prompt with auto-created webhook details
- [ ] 17.4 Implement "Add to My Account" button functionality
- [ ] 17.5 Implement "Keep Anonymous" button functionality
- [ ] 17.6 Show success message after claiming webhook
- [ ] 17.7 Add ownership indicators ("Owned" vs "Anonymous" badges)
- [ ] 17.8 Redirect to dashboard after claiming or declining

## 18. Navigation and Routing

- [ ] 18.1 Implement homepage route (`/`) with auth-based rendering
- [ ] 18.2 Add redirect logic for anonymous users visiting homepage
- [ ] 18.3 Create protected route wrapper for authenticated-only pages
- [ ] 18.4 Add "Dashboard" link in header for authenticated users
- [ ] 18.5 Hide dashboard navigation options for anonymous users
- [ ] 18.6 Handle direct URL access to webhook detail pages (ownership check)

## 19. Docker Configuration

- [ ] 19.1 Create Dockerfile with multi-stage build (node:20-alpine)
- [ ] 19.2 Create docker-compose.yml with app and postgres services
- [ ] 19.3 Add PostgreSQL volume for data persistence
- [ ] 19.4 Configure environment variables in docker-compose
- [ ] 19.5 Add health checks for services
- [ ] 19.6 Test Docker build and run locally

## 20. WebSocket Client Integration

- [ ] 20.1 Create WebSocket context/provider for React
- [ ] 20.2 Implement auto-reconnect with exponential backoff
- [ ] 20.3 Add connection status indicator in UI
- [ ] 20.4 Handle rejoining rooms after reconnection
- [ ] 20.5 Clean up connections on component unmount
- [ ] 20.6 Add error handling for connection failures

## 21. Utilities and Helpers

- [ ] 21.1 Create token generation utility (crypto-based random)
- [ ] 21.2 Create token sanitization utility
- [ ] 21.3 Add date/time formatting utilities
- [ ] 21.4 Create IP address parsing utility (handle IPv4/IPv6)
- [ ] 21.5 Add request body size detection
- [ ] 21.6 Create copy-to-clipboard utility
- [ ] 21.7 Create anonymous session ID generator
- [ ] 21.8 Create auth state utility (isAuthenticated, isAnonymous)

## 22. Testing and Validation

- [ ] 22.1 Test webhook creation with auto-generated tokens
- [ ] 22.2 Test webhook creation with custom tokens and sanitization
- [ ] 22.3 Test duplicate token validation
- [ ] 22.4 Test all HTTP methods (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
- [ ] 22.5 Test request capture with various body types (JSON, XML, form data)
- [ ] 22.6 Test request body size limit (50 MB)
- [ ] 22.7 Test WebSocket real-time updates
- [ ] 22.8 Test custom response configuration
- [ ] 22.9 Test webhook enable/disable functionality
- [ ] 22.10 Test anonymous mode (auto-creation, redirect, session persistence)
- [ ] 22.11 Test anonymous homepage redirect to webhook detail
- [ ] 22.12 Test user registration and login
- [ ] 22.13 Test webhook claiming workflow
- [ ] 22.14 Test request soft-delete cleanup job for anonymous webhooks
- [ ] 22.15 Test authenticated user request persistence (no soft-delete)
- [ ] 22.16 Test webhook soft-deletion (sets deletedAt, hides from UI)
- [ ] 22.17 Test soft-deleted webhooks are excluded from list queries
- [ ] 22.18 Test soft-deleted requests are excluded from request list
- [ ] 22.19 Test anonymous user cannot access management features
- [ ] 22.20 Test authenticated user sees dashboard on homepage
- [ ] 22.21 Test dark mode functionality
- [ ] 22.22 Test request search and filtering
- [ ] 22.23 Test soft-delete middleware filters correctly
- [ ] 22.24 Test Docker deployment end-to-end

## 23. Documentation and Polish

- [ ] 23.1 Update README.md with setup instructions
- [ ] 23.2 Add Docker usage instructions
- [ ] 23.3 Create API documentation (endpoints, request/response formats)
- [ ] 23.4 Add environment variable documentation
- [ ] 23.5 Document authentication and anonymous mode features
- [ ] 23.6 Document webhook claiming workflow
- [ ] 23.7 Document user flow differences (anonymous vs authenticated)
- [ ] 23.8 Document dark mode feature
- [ ] 23.9 Document request search and filtering
- [ ] 23.10 Document soft-delete architecture and data recovery
- [ ] 23.11 Test responsive design on different screen sizes
- [ ] 23.11 Add loading states for async operations
- [ ] 23.12 Add error boundaries for component failures
