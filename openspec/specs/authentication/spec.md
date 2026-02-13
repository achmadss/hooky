# authentication Specification

## Purpose
TBD - created by archiving change hooky. Update Purpose after archive.
## Requirements
### Requirement: Anonymous session creation with auto-redirect
The system SHALL automatically create a webhook and redirect anonymous users when they visit the homepage.

#### Scenario: Anonymous user visits homepage
- **WHEN** user navigates to homepage (`/`) without authentication
- **THEN** system creates anonymous session with unique session ID
- **AND** stores session ID in HTTP-only cookie
- **AND** system generates random 16-character token
- **AND** system creates new webhook with the token
- **AND** webhook ownerId is set to null
- **AND** webhook is associated with anonymous session
- **AND** system redirects to `/webhooks/{webhookId}`

#### Scenario: Anonymous user with existing session visits homepage
- **WHEN** user with existing anonymous session navigates to homepage (`/`)
- **THEN** system checks for existing webhook associated with session
- **AND** IF webhook exists, redirects to `/webhooks/{existingWebhookId}`
- **AND** IF no webhook exists, creates new webhook and redirects

#### Scenario: Anonymous session persistence
- **WHEN** user returns to app within session lifetime
- **THEN** system recognizes anonymous session from cookie
- **AND** user can access their auto-created webhook

#### Scenario: Anonymous session expiration
- **WHEN** anonymous session cookie expires after 6 days
- **THEN** system creates new anonymous session on next visit
- **AND** system creates new auto-generated webhook
- **AND** redirects to the new webhook detail page
- **AND** previous webhooks remain accessible via direct URL
- **AND** requests in previous webhooks are cleaned up on day 7

### Requirement: User registration
The system SHALL allow users to create accounts for persistent webhook storage.

#### Scenario: Register new account
- **WHEN** user submits registration form with email and password
- **THEN** system creates user account
- **AND** hashes password securely
- **AND** creates authenticated session
- **AND** redirects to homepage

#### Scenario: Registration with existing email
- **WHEN** user attempts to register with email that already exists
- **THEN** system returns 409 Conflict error
- **AND** displays message "Email already registered"

#### Scenario: Registration validation
- **WHEN** user submits registration with invalid email format
- **THEN** system returns 400 Bad Request with validation errors

### Requirement: User login
The system SHALL allow users to log in to their accounts.

#### Scenario: Login with valid credentials
- **WHEN** user submits login form with valid email and password
- **THEN** system authenticates user
- **AND** creates authenticated session
- **AND** redirects to homepage

#### Scenario: Login with invalid credentials
- **WHEN** user submits login form with incorrect password
- **THEN** system returns 401 Unauthorized
- **AND** displays message "Invalid credentials"

#### Scenario: Login with non-existent email
- **WHEN** user submits login form with email not in system
- **THEN** system returns 401 Unauthorized
- **AND** displays generic error message (security)

### Requirement: User logout
The system SHALL allow users to log out of their accounts.

#### Scenario: Logout user
- **WHEN** user clicks logout button
- **THEN** system destroys authenticated session
- **AND** clears session cookies
- **AND** redirects to homepage as anonymous user

### Requirement: Anonymous mode functionality
The system SHALL provide instant webhook access to anonymous users with request inspection functionality only.

#### Scenario: Anonymous user gets auto-created webhook
- **WHEN** anonymous user visits homepage
- **THEN** system auto-creates webhook with random token
- **AND** webhook is created with ownerId set to null
- **AND** webhook is associated with anonymous session
- **AND** user is redirected to webhook detail page

#### Scenario: Anonymous mode indicator
- **WHEN** user is in anonymous mode
- **THEN** UI displays persistent banner or indicator
- **AND** indicator shows "Anonymous Mode - Requests auto-deleted after 7 days"
- **AND** indicator includes link to register/login

#### Scenario: Anonymous user receives real-time updates
- **WHEN** anonymous user is viewing webhook detail page
- **THEN** system broadcasts new requests via WebSocket
- **AND** functionality is identical to authenticated users for request inspection

#### Scenario: Anonymous user cannot access management features
- **WHEN** anonymous user attempts to access `/` (homepage/dashboard)
- **THEN** system redirects to their auto-created webhook detail page
- **AND** user cannot create additional webhooks
- **AND** user cannot access webhook list view
- **AND** user cannot delete or enable/disable webhooks

#### Scenario: Anonymous user can configure response
- **WHEN** anonymous user views webhook detail page
- **THEN** user can configure custom response (status, headers, body)
- **AND** user can view and inspect incoming requests
- **AND** user can copy webhook URL

### Requirement: Webhook claiming workflow
The system SHALL prompt anonymous users to claim their auto-created webhook when logging in.

#### Scenario: Detect unclaimed webhook on login
- **WHEN** user logs in from webhook detail page
- **AND** webhook has matching anonymous session
- **AND** webhook has null ownerId
- **THEN** system detects unclaimed webhook
- **AND** prompts user to claim it

#### Scenario: Prompt displays unclaimed webhook
- **WHEN** claim prompt is shown
- **THEN** prompt displays the auto-created webhook token/name
- **AND** explains benefits of claiming (persistent storage, management dashboard)
- **AND** explains they can create more webhooks after claiming

#### Scenario: User claims unclaimed webhook
- **WHEN** user confirms they want to claim webhook
- **THEN** system updates webhook ownerId to authenticated userId
- **AND** webhook is transferred to user's account
- **AND** requests are no longer subject to 7-day cleanup
- **AND** success message is displayed
- **AND** user can now access full management dashboard at `/`

#### Scenario: User declines claiming webhook
- **WHEN** user chooses not to claim webhook
- **THEN** webhook remains with null ownerId
- **AND** webhook remains associated with anonymous session
- **AND** requests continue to be auto-deleted after 7 days
- **AND** user is taken to management dashboard `/` (but webhook remains anonymous)
- **AND** user can create new owned webhooks from dashboard

#### Scenario: No unclaimed webhook on login
- **WHEN** user logs in with no unclaimed webhook (already claimed or none exists)
- **THEN** no prompt is shown
- **AND** user proceeds to homepage normally
- **AND** user sees management dashboard

### Requirement: Session management
The system SHALL manage sessions for both anonymous and authenticated users.

#### Scenario: Anonymous session cookie
- **WHEN** anonymous session is created
- **THEN** system sets HTTP-only cookie with session ID
- **AND** cookie has Secure flag in production
- **AND** cookie has SameSite=Lax or Strict

#### Scenario: Authenticated session cookie
- **WHEN** user logs in
- **THEN** system replaces anonymous session with authenticated session
- **AND** preserves anonymous session ID for webhook claiming detection

#### Scenario: Session security
- **WHEN** session cookie is tampered with
- **THEN** system invalidates session
- **AND** creates new anonymous session

### Requirement: Protected routes
The system SHALL protect certain routes and API endpoints based on authentication.

#### Scenario: Access homepage as authenticated user
- **WHEN** authenticated user navigates to `/`
- **THEN** system displays webhook management dashboard
- **AND** user can see list of owned webhooks
- **AND** user can create new webhooks

#### Scenario: Access homepage as anonymous user
- **WHEN** anonymous user navigates to `/`
- **THEN** system auto-creates webhook
- **AND** redirects to `/webhooks/{webhookId}`
- **AND** user does not see management dashboard

#### Scenario: Access webhook list API as authenticated user
- **WHEN** authenticated user requests `/api/webhooks`
- **THEN** system returns only webhooks owned by user

#### Scenario: Anonymous access to webhook list API
- **WHEN** anonymous user requests `/api/webhooks`
- **THEN** system returns 403 Forbidden
- **AND** does not allow listing webhooks

#### Scenario: Access webhook detail
- **WHEN** user requests webhook detail via `/api/webhooks/{id}`
- **AND** user owns the webhook or it's associated with their anonymous session
- **THEN** system returns webhook details

#### Scenario: Unauthorized webhook access
- **WHEN** user requests webhook detail they don't own
- **AND** webhook is not associated with their anonymous session
- **THEN** system returns 403 Forbidden

#### Scenario: Create webhook as authenticated user
- **WHEN** authenticated user sends POST to `/api/webhooks`
- **THEN** system creates webhook with userId as owner
- **AND** returns 201 Created

#### Scenario: Create webhook as anonymous user
- **WHEN** anonymous user sends POST to `/api/webhooks`
- **THEN** system returns 403 Forbidden
- **AND** anonymous users cannot create webhooks via API (only auto-creation on homepage)

#### Scenario: Delete webhook as authenticated user
- **WHEN** authenticated user sends DELETE to `/api/webhooks/{id}`
- **AND** user owns the webhook
- **THEN** system deletes webhook
- **AND** returns 204 No Content

#### Scenario: Delete webhook as anonymous user
- **WHEN** anonymous user sends DELETE to `/api/webhooks/{id}`
- **THEN** system returns 403 Forbidden
- **AND** anonymous users cannot delete webhooks

### Requirement: Password security
The system SHALL securely store and validate user passwords.

#### Scenario: Password hashing
- **WHEN** user registers or changes password
- **THEN** system hashes password using bcrypt or Argon2
- **AND** never stores plain-text password

#### Scenario: Minimum password requirements
- **WHEN** user registers with password
- **THEN** system validates minimum length (8 characters)
- **AND** validates password complexity (optional: uppercase, lowercase, number)

### Requirement: Authentication provider extensibility
The system SHALL be designed to easily support additional authentication providers in the future.

#### Scenario: Email/password authentication (current)
- **WHEN** system is configured
- **THEN** email/password authentication is the primary method
- **AND** all features work with email/password auth

#### Scenario: OAuth provider extensibility
- **WHEN** developers want to add OAuth providers (GitHub, Google, etc.)
- **THEN** codebase structure allows easy addition of new providers
- **AND** NextAuth.js configuration supports multiple providers
- **AND** user model can store provider-specific data
- **AND** no database schema changes required for adding OAuth providers

#### Scenario: Future OAuth integration
- **WHEN** OAuth provider is added to NextAuth.js config
- **THEN** users can log in with the new provider
- **AND** accounts are linked to existing users by email
- **AND** all existing features continue to work

### Requirement: User account soft-delete
The system SHALL use soft-delete for user account deletion.

#### Scenario: User account soft-deletion
- **WHEN** user requests account deletion
- **THEN** system sets `deletedAt` timestamp on user record
- **AND** user account is marked as deleted but data remains in database
- **AND** user can no longer log in (authentication fails)
- **AND** webhooks owned by user remain in system with ownership preserved

#### Scenario: Soft-deleted user cannot log in
- **WHEN** soft-deleted user attempts to log in
- **THEN** system returns 401 Unauthorized
- **AND** error message indicates "Account has been deleted"

#### Scenario: Soft-deleted user cannot register with same email
- **WHEN** soft-deleted user attempts to register with same email
- **THEN** system returns 409 Conflict
- **AND** message indicates "Email already registered"

#### Scenario: Query excludes soft-deleted users
- **WHEN** system queries for users
- **THEN** results exclude users where `deletedAt` is not null
- **AND** only active users are returned

