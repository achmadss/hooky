# Tasks: Hooky Implementation

## 1. Project Setup and Database

- [x] 1.1 Install required dependencies: Prisma, Socket.io, @socket.io/client, NextAuth.js
- [x] 1.2 Initialize Prisma with PostgreSQL provider
- [x] 1.3 Create database schema with User, Webhook, Request, and ResponseConfig models
- [x] 1.4 Add User model with email, passwordHash, createdAt, deletedAt (nullable) fields
- [x] 1.5 Add anonymous session support to Webhook model (ownerId nullable, sessionId)
- [x] 1.6 Add isEnabled field to Webhook model (default: true)
- [x] 1.7 Add deletedAt field (nullable) to all models: User, Webhook, Request, ResponseConfig
- [x] 1.8 Add Prisma middleware for automatic soft-delete filtering
- [x] 1.9 Create and run initial database migration
- [x] 1.10 Set up environment variables (.env.example with DATABASE_URL, NEXTAUTH_SECRET)
- [x] 1.11 Create database connection utility (lib/db/index.ts)

## 2. Authentication and Anonymous Session Setup

- [x] 2.1 Configure NextAuth.js with credentials provider
- [x] 2.2 Implement password hashing using bcrypt
- [x] 2.3 Create anonymous session middleware with session ID generation
- [x] 2.4 Implement session cookie handling (HTTP-only, Secure, SameSite)
- [x] 2.5 Create auth context/provider for React
- [x] 2.6 Implement auth guards for protected routes
- [x] 2.7 Add NEXTAUTH_SECRET and NEXTAUTH_URL to environment variables
- [x] 2.8 Implement anonymous session storage (cookie-based)
- [x] 2.9 Create utility to check if user is anonymous vs authenticated
- [x] 2.10 Implement anonymous session persistence across page reloads
- [x] 2.11 Design auth system architecture for OAuth provider extensibility
- [x] 2.12 Configure NextAuth.js to support multiple providers (for future OAuth)
- [x] 2.13 Ensure user model can store provider-specific data without schema changes

## 3. Webhook Management API

- [x] 3.1 Implement POST /api/webhooks - create webhook with auto-generated token (authenticated only)
- [x] 3.2 Implement token generation utility (16-char alphanumeric random)
- [x] 3.3 Implement token sanitization (lowercase, spaces to dashes, alphanumeric only)
- [x] 3.4 Add validation for custom tokens (3-64 chars, unique check)
- [x] 3.5 Implement GET /api/webhooks - list webhooks for authenticated user only (403 for anonymous)
- [x] 3.6 Implement GET /api/webhooks/[id] - get single webhook details with ownership/session check
- [x] 3.7 Implement PATCH /api/webhooks/[id] - update webhook (enable/disable, name) (authenticated only)
- [x] 3.8 Implement DELETE /api/webhooks/[id] - soft-delete webhook and associated requests (authenticated only)
- [x] 3.9 Implement GET /api/webhooks/unclaimed - get unclaimed webhook for claiming
- [x] 3.10 Implement POST /api/webhooks/claim - claim ownership of anonymous webhook
- [x] 3.11 Add authentication guards to restrict anonymous users from management endpoints
- [x] 3.12 Implement ownership validation middleware for protected operations
- [x] 3.13 Implement soft-delete middleware for Prisma queries (automatically filter deletedAt IS NULL)
- [x] 3.14 Add global query extension to exclude soft-deleted records by default
- [x] 3.15 Create utility function for soft-delete operations (set deletedAt timestamp)

## 4. Homepage Auto-Create and Redirect

- [x] 4.1 Create homepage route handler (`/page.tsx`) with authentication check
- [x] 4.2 Implement anonymous user detection on homepage visit
- [x] 4.3 Implement auto-webhook creation for anonymous users (random token)
- [x] 4.4 Implement redirect to `/webhooks/{id}` after auto-creation
- [x] 4.5 Implement check for existing anonymous webhook on homepage revisit
- [x] 4.6 Redirect existing anonymous users to their webhook detail page
- [x] 4.7 Display management dashboard for authenticated users on homepage
- [x] 4.8 Handle edge case: anonymous user with expired session visiting homepage

## 5. Request Capture API

- [x] 5.1 Create catch-all API route /api/wh/[token]/route.ts for all HTTP methods
- [x] 5.2 Implement request validation (check if webhook token exists and is enabled)
- [x] 5.3 Implement request data extraction (method, headers, query params, body)
- [x] 5.4 Implement metadata extraction (timestamp, source IP, user agent)
- [x] 5.5 Implement request persistence to database
- [x] 5.6 Return default 200 response for requests to valid enabled webhooks
- [x] 5.7 Return 404 for disabled webhooks without capturing requests
- [x] 5.8 Implement request body size limit (50 MB maximum)
- [x] 5.9 Add MAX_REQUEST_BODY_SIZE_MB environment variable (default: 50)
- [x] 5.10 Return 413 Payload Too Large for requests exceeding size limit
- [x] 5.11 Implement text-based body handling (JSON, XML, plain text, form data)
- [x] 5.12 Reject binary Content-Type requests with 415 Unsupported Media Type
- [x] 5.13 Add check for binary Content-Type prefixes (image/, video/, audio/, application/octet-stream)
- [x] 5.14 Ensure request queries filter out soft-deleted records (deletedAt IS NULL)

## 6. Response Configuration API

- [x] 6.1 Implement GET /api/webhooks/[id]/response - get response config
- [x] 6.2 Implement PUT /api/webhooks/[id]/response - update response config
- [x] 6.3 Add validation for status code (100-599 range)
- [x] 6.4 Implement DELETE /api/webhooks/[id]/response - reset to defaults
- [x] 6.5 Update request capture to use custom response if configured
- [x] 6.6 Return default response (200, text/plain, empty body) when no config exists

## 7. WebSocket Server

- [x] 7.1 Set up Socket.io server in Next.js (socket.ts or similar)
- [x] 7.2 Implement connection handling and connection ID assignment
- [x] 7.3 Implement "join" event handler to add client to webhook room
- [x] 7.4 Implement "leave" event handler to remove client from room
- [x] 7.5 Implement request broadcasting to webhook rooms on new capture
- [x] 7.6 Add connection status events (connected, disconnect, error)
- [x] 7.7 Handle client disconnections and cleanup

## 8. Soft-Delete Cleanup Job

- [x] 8.1 Implement cleanup job using node-cron or similar
- [x] 8.2 Create soft-delete query to mark requests as deleted (set deletedAt) older than 7 days for anonymous webhooks
- [x] 8.3 Set anonymous session cookie expiry to 6 days
- [x] 8.4 Add logging for cleanup job activity (log number of soft-deleted records)
- [x] 8.5 Schedule cleanup job to run daily at midnight UTC
- [x] 8.6 Make retention period configurable via ANONYMOUS_RETENTION_DAYS env var (default: 7)
- [x] 8.7 Make session expiry configurable via ANONYMOUS_SESSION_EXPIRY_DAYS env var (default: 6)
- [x] 8.8 Add error handling and retry logic for cleanup failures
- [x] 8.9 Ensure all queries filter out soft-deleted records by default

## 9. Webhook Management UI (Authenticated Only)

- [x] 9.1 Create homepage dashboard for authenticated users showing ONLY owned webhooks
- [x] 9.2 Implement CreateWebhookForm component with name and custom token inputs
- [x] 9.3 Add live token preview with sanitization
- [x] 9.4 Implement webhook list item with token, creation date, request count, and ownership badge
- [x] 9.5 Add empty state for webhook list with CTA to create webhook
- [x] 9.6 Implement webhook soft-deletion with confirmation dialog (authenticated only) - sets deletedAt timestamp
- [x] 9.7 Add webhook enable/disable toggle with visual status indicator (authenticated only)
- [x] 9.8 Show warning banner for disabled webhooks
- [x] 9.9 Ensure anonymous users cannot see management UI elements (create, delete, enable/disable buttons)
- [x] 9.10 Dashboard shows only owned webhooks (unclaimed anonymous webhooks NOT shown)

## 10. Request Inspector UI - Request List

- [x] 10.1 Create webhook detail page at /webhooks/[id]/page.tsx
- [x] 10.2 Implement RequestList component showing captured requests
- [x] 10.3 Add request list item with method badge and timestamp
- [x] 10.4 Implement WebSocket client connection and room joining
- [x] 10.5 Add real-time request updates to the list
- [x] 10.6 Implement request selection highlighting
- [x] 10.7 Add empty state for request list with instructions
- [x] 10.8 Show anonymous retention warning for unowned webhooks

## 11. Request Inspector UI - Request Detail

- [x] 11.1 Create RequestDetail component with overview (method, timestamp, IP, user agent)
- [x] 11.2 Implement PrettyPayloadViewer with JSON syntax highlighting
- [x] 11.3 Add XML formatting support in payload viewer
- [x] 11.4 Implement RawRequestViewer showing complete HTTP request
- [x] 11.5 Create HeadersExplorer component with table view
- [x] 11.6 Add header search/filter functionality
- [x] 11.7 Create QueryParamsExplorer component
- [x] 11.8 Implement copy-to-clipboard functionality for various fields

## 12. Response Configuration UI (Authenticated Only)

- [x] 12.1 Create ResponseConfigPanel component (visible only to authenticated users who own the webhook)
- [x] 12.2 Implement status code input with validation
- [x] 12.3 Create headers editor (key-value pair input)
- [x] 12.4 Add response body textarea
- [x] 12.5 Implement save functionality with API integration
- [x] 12.6 Add "Reset to Defaults" button
- [x] 12.7 Show success/error messages on save
- [x] 12.8 Hide Response Configuration tab for anonymous users
- [x] 12.9 Show read-only default response info for anonymous users (200 OK)

## 13. Webhook Detail Page Layout

- [x] 13.1 Create page layout with sidebar (request list) and main panel (request detail)
- [x] 13.2 Display webhook URL prominently with copy button
- [x] 13.3 Add tabs or sections for Request Inspector and Response Config
- [x] 13.4 Implement responsive layout for mobile devices
- [x] 13.5 Add back button to home page (only for authenticated users)
- [x] 13.6 Handle 404 for non-existent webhooks
- [x] 13.7 Add "Back to Dashboard" button for authenticated users
- [x] 13.8 Hide dashboard navigation for anonymous users

## 14. Dark Mode Support

- [x] 14.1 Configure Tailwind CSS for dark mode (darkMode: 'class')
- [x] 14.2 Create ThemeProvider context for managing theme state
- [x] 14.3 Implement system preference detection on initial load
- [x] 14.4 Create dark mode toggle button in header
- [x] 14.5 Store user theme preference in localStorage
- [x] 14.6 Update all UI components to support dark mode classes
- [x] 14.7 Implement dark mode styles for:
  - Background colors
  - Text colors
  - Border colors
  - Button styles
  - Input fields
  - Tables and lists
  - Sidebar and navigation
- [x] 14.8 Update code/syntax highlighting for dark mode
- [ ] 14.9 Test all components in both light and dark modes

## 15. Request Search and Filtering UI

- [x] 15.1 Create SearchFilterPanel component for request list
- [x] 15.2 Implement search input with real-time filtering
- [x] 15.3 Add search by HTTP method (GET, POST, PUT, etc.)
- [x] 15.4 Add search by request body content
- [x] 15.5 Add search by headers
- [x] 15.6 Create time range filter dropdown (Last hour, 24 hours, 7 days, All time)
- [x] 15.7 Implement search highlighting in results
- [x] 15.8 Add search results count display
- [x] 15.9 Create "Clear filters" button
- [x] 15.10 Handle empty search results state
- [x] 15.11 Optimize search performance for large request lists

## 16. Authentication UI

- [x] 16.1 Create AuthModal component with login and registration forms
- [x] 16.2 Implement form validation for email and password
- [x] 16.3 Add error handling for auth failures
- [x] 16.4 Create AuthButtons component for header (Sign Up/Log In or User menu)
- [x] 16.5 Implement password visibility toggle
- [x] 16.6 Add loading states for auth submissions
- [x] 16.7 Create anonymous mode banner with retention warning
- [x] 16.8 Add "Sign Up to Save" CTA button in anonymous banner

## 17. Webhook Claiming UI

- [x] 17.1 Create WebhookClaimPrompt modal component
- [x] 17.2 Implement detection of unclaimed webhook on login
- [x] 17.3 Display claim prompt with auto-created webhook details
- [x] 17.4 Implement "Add to My Account" button functionality
- [x] 17.5 Implement "Keep Anonymous" button functionality
- [x] 17.6 Show success message after claiming webhook
- [x] 17.7 Add ownership indicators ("Owned" vs "Anonymous" badges)
- [x] 17.8 Redirect to dashboard after claiming or declining

## 18. Navigation and Layout

- [x] 18.1 Implement homepage route (`/`) with auth-based rendering
- [x] 18.2 Add redirect logic for anonymous users visiting homepage
- [x] 18.3 Create protected route wrapper for authenticated-only pages
- [x] 18.4 Create Global Navbar component (App Name left, Profile right)
- [x] 18.5 Implement Profile Avatar component (Circle, Image or Initials fallback)
- [x] 18.6 Implement Profile Dropdown menu (Dashboard, Theme Toggle, Logout)
- [x] 18.7 Integrate Global Navbar into main layout
- [x] 18.8 Handle direct URL access to webhook detail pages (authenticated users can view any; anonymous only own)

## 19. Docker Configuration

- [x] 19.1 Create Dockerfile with multi-stage build (node:20-alpine)
- [x] 19.2 Create docker-compose.yml with app and postgres services
- [x] 19.3 Add PostgreSQL volume for data persistence
- [x] 19.4 Configure environment variables in docker-compose
- [x] 19.5 Add health checks for services
- [ ] 19.6 Test Docker build and run locally

## 20. WebSocket Client Integration

- [x] 20.1 Create WebSocket context/provider for React
- [x] 20.2 Implement auto-reconnect with exponential backoff
- [x] 20.3 Add connection status indicator in UI
- [x] 20.4 Handle rejoining rooms after reconnection
- [x] 20.5 Clean up connections on component unmount
- [x] 20.6 Add error handling for connection failures

## 21. Utilities and Helpers

- [x] 21.1 Create token generation utility (crypto-based random)
- [x] 21.2 Create token sanitization utility
- [x] 21.3 Add date/time formatting utilities
- [x] 21.4 Create IP address parsing utility (handle IPv4/IPv6)
- [x] 21.5 Add request body size detection
- [x] 21.6 Create copy-to-clipboard utility
- [x] 21.7 Create anonymous session ID generator
- [x] 21.8 Create auth state utility (isAuthenticated, isAnonymous)

## 22. Testing and Validation

- [x] 22.1 Test webhook creation with auto-generated tokens
- [x] 22.2 Test webhook creation with custom tokens and sanitization
- [x] 22.3 Test duplicate token validation
- [x] 22.4 Test all HTTP methods (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
- [x] 22.5 Test request capture with various body types (JSON, XML, form data)
- [ ] 22.6 Test request body size limit (50 MB)
- [x] 22.7 Test WebSocket real-time updates
- [x] 22.8 Test custom response configuration
- [x] 22.9 Test webhook enable/disable functionality
- [x] 22.10 Test anonymous mode (auto-creation, redirect, session persistence)
- [x] 22.11 Test anonymous homepage redirect to webhook detail
- [x] 22.12 Test user registration and login
- [x] 22.13 Test webhook claiming workflow
- [ ] 22.14 Test request soft-delete cleanup job for anonymous webhooks
- [x] 22.15 Test authenticated user request persistence (no soft-delete)
- [x] 22.16 Test webhook soft-deletion (sets deletedAt, hides from UI)
- [x] 22.17 Test soft-deleted webhooks are excluded from list queries
- [x] 22.18 Test soft-deleted requests are excluded from request list
- [x] 22.19 Test anonymous user cannot access management features
- [x] 22.20 Test authenticated user sees dashboard on homepage
- [x] 22.21 Test dark mode functionality
- [x] 22.22 Test request search and filtering
- [x] 22.23 Test soft-delete middleware filters correctly
- [ ] 22.24 Test Docker deployment end-to-end
- [x] 22.25 Test session invalidation after database reset
- [x] 22.26 Test historical token display in request details (webhookToken field)

## 23. Documentation and Polish

- [x] 23.1 Update README.md with setup instructions
- [x] 23.2 Add Docker usage instructions
- [x] 23.3 Create API documentation (endpoints, request/response formats)
- [x] 23.4 Add environment variable documentation
- [x] 23.5 Document authentication and anonymous mode features
- [x] 23.6 Document webhook claiming workflow
- [x] 23.7 Document user flow differences (anonymous vs authenticated)
- [x] 23.8 Document dark mode feature
- [x] 23.9 Document request search and filtering
- [x] 23.10 Document soft-delete architecture and data recovery
- [ ] 23.11 Test responsive design on different screen sizes
- [x] 23.11 Add loading states for async operations
- [x] 23.12 Add error boundaries for component failures
