# webhook-management Specification

## Purpose
TBD - created by archiving change hooky. Update Purpose after archive.
## Requirements
### Requirement: Webhook creation with auto-generated token (Authenticated)
The system SHALL allow authenticated users to create a new webhook endpoint with an auto-generated random token.

#### Scenario: Authenticated user creates webhook with auto-generated token
- **WHEN** authenticated user sends POST request to `/api/webhooks` without providing a custom token
- **THEN** system generates a unique 16-character alphanumeric token
- **AND** system creates a new webhook record in the database
- **AND** system sets ownerId to authenticated user's ID
- **AND** system returns the webhook details including the generated token

### Requirement: Webhook creation with custom token (Authenticated)
The system SHALL allow authenticated users to create a webhook with a custom token, subject to validation and sanitization rules.

#### Scenario: Authenticated user creates webhook with valid custom token
- **WHEN** authenticated user sends POST request to `/api/webhooks` with a custom token "my-webhook"
- **THEN** system validates the token meets requirements (3-64 chars, alphanumeric with dashes)
- **AND** system checks the token is not already in use
- **AND** system creates the webhook with the sanitized token
- **AND** system sets ownerId to authenticated user's ID

#### Scenario: Create webhook with duplicate token
- **WHEN** user attempts to create a webhook with a token that already exists
- **THEN** system returns a 409 Conflict error with message "Token already in use"

#### Scenario: Create webhook with invalid token characters
- **WHEN** user attempts to create a webhook with token containing special characters "my@webhook!"
- **THEN** system sanitizes the token to "my-webhook" by removing invalid characters
- **AND** system converts spaces to dashes
- **AND** system converts to lowercase

#### Scenario: Create webhook with token too short
- **WHEN** user attempts to create a webhook with token "ab"
- **THEN** system returns a 400 Bad Request error with message "Token must be at least 3 characters"

#### Scenario: Create webhook with token too long
- **WHEN** user attempts to create a webhook with token longer than 64 characters
- **THEN** system returns a 400 Bad Request error with message "Token must not exceed 64 characters"

### Requirement: Anonymous webhook auto-creation
The system SHALL auto-create a webhook for anonymous users on homepage visit.

#### Scenario: Anonymous user visits homepage
- **WHEN** anonymous user navigates to `/` (homepage)
- **THEN** system generates a unique 16-character alphanumeric token
- **AND** system creates a new webhook record with ownerId set to null
- **AND** system associates webhook with anonymous session
- **AND** system redirects to `/webhooks/{webhookId}`

#### Scenario: Anonymous user with existing webhook visits homepage
- **WHEN** anonymous user with existing webhook navigates to `/`
- **THEN** system redirects to existing webhook detail page `/webhooks/{existingWebhookId}`
- **AND** does not create a new webhook

#### Scenario: Anonymous user cannot create webhook via API
- **WHEN** anonymous user sends POST request to `/api/webhooks`
- **THEN** system returns 403 Forbidden
- **AND** error message indicates "Authentication required"

### Requirement: Webhook listing (Authenticated Only)
The system SHALL allow authenticated users to list their webhooks.

#### Scenario: Authenticated user lists all active webhooks
- **WHEN** authenticated user sends GET request to `/api/webhooks`
- **THEN** system returns a list of webhooks owned by the user
- **AND** soft-deleted webhooks (where `deletedAt` is not null) are excluded
- **AND** each webhook includes: id, token, name, creation date, request count, isEnabled status

#### Scenario: List webhooks when none exist
- **WHEN** authenticated user sends GET request to `/api/webhooks` and no webhooks exist
- **THEN** system returns an empty array

#### Scenario: Anonymous user cannot list webhooks
- **WHEN** anonymous user sends GET request to `/api/webhooks`
- **THEN** system returns 403 Forbidden
- **AND** error message indicates "Authentication required"

### Requirement: Webhook retrieval
The system SHALL allow users to retrieve details of a specific webhook.

#### Scenario: Get webhook by ID
- **WHEN** user sends GET request to `/api/webhooks/{id}`
- **THEN** system returns the webhook details including id, token, name, creation date, and request count

#### Scenario: Get non-existent webhook
- **WHEN** user sends GET request to `/api/webhooks/{id}` for a webhook that does not exist
- **THEN** system returns a 404 Not Found error

### Requirement: Webhook soft-deletion (Authenticated Only)
The system SHALL allow authenticated users to soft-delete webhooks they own. All webhook deletions are soft-deletes.

#### Scenario: Authenticated user soft-deletes owned webhook
- **WHEN** authenticated user sends DELETE request to `/api/webhooks/{id}`
- **AND** webhook is owned by the user
- **THEN** system sets `deletedAt` timestamp on the webhook
- **AND** all associated requests are soft-deleted (marked with `deletedAt`)
- **AND** webhook is hidden from UI and API responses
- **AND** system returns a 204 No Content response

#### Scenario: Soft-deleted webhook not returned in list
- **WHEN** authenticated user lists their webhooks after soft-deleting one
- **THEN** the soft-deleted webhook is not included in the list
- **AND** webhook remains in database with `deletedAt` timestamp

#### Scenario: Get soft-deleted webhook returns 404
- **WHEN** user sends GET request to `/api/webhooks/{id}` for a soft-deleted webhook
- **THEN** system returns a 404 Not Found error
- **AND** webhook data remains in database (recoverable)

#### Scenario: Delete non-existent webhook
- **WHEN** user sends DELETE request to `/api/webhooks/{id}` for a webhook that does not exist or is already soft-deleted
- **THEN** system returns a 404 Not Found error

#### Scenario: Anonymous user cannot delete webhook
- **WHEN** anonymous user sends DELETE request to `/api/webhooks/{id}`
- **THEN** system returns 403 Forbidden
- **AND** error message indicates "Authentication required"

#### Scenario: User cannot delete webhook they don't own
- **WHEN** authenticated user sends DELETE request to `/api/webhooks/{id}`
- **AND** webhook is owned by different user
- **THEN** system returns 403 Forbidden
- **AND** error message indicates "Not authorized to delete this webhook"

### Requirement: Token uniqueness
The system SHALL ensure all webhook tokens are unique across the system.

#### Scenario: Concurrent token creation
- **WHEN** two users simultaneously attempt to create webhooks with the same custom token
- **THEN** only one webhook is created successfully
- **AND** the second request receives a 409 Conflict error

### Requirement: Webhook ownership
The system SHALL track webhook ownership with optional user association.

#### Scenario: Auto-created webhook for anonymous user
- **WHEN** anonymous user visits homepage `/`
- **THEN** system auto-creates webhook with ownerId set to null
- **AND** webhook is associated with anonymous session
- **AND** webhook is marked as anonymous

#### Scenario: Create webhook as authenticated user
- **WHEN** authenticated user creates webhook via API
- **THEN** system creates webhook with ownerId set to current userId
- **AND** webhook is marked as owned

#### Scenario: List webhooks for authenticated user
- **WHEN** authenticated user sends GET request to `/api/webhooks`
- **THEN** system returns only webhooks owned by the user

#### Scenario: Anonymous user cannot list webhooks via API
- **WHEN** anonymous user sends GET request to `/api/webhooks`
- **THEN** system returns 403 Forbidden
- **AND** anonymous users can only access their single auto-created webhook

### Requirement: Webhook enable/disable (Authenticated Only)
The system SHALL allow authenticated users to enable and disable webhooks they own.

#### Scenario: Authenticated user disables enabled webhook
- **WHEN** authenticated user sends PATCH request to `/api/webhooks/{id}` with `isEnabled: false`
- **AND** webhook is owned by the user
- **THEN** system updates webhook isEnabled flag to false
- **AND** subsequent requests to the webhook return 404 Not Found

#### Scenario: Authenticated user enables disabled webhook
- **WHEN** authenticated user sends PATCH request to `/api/webhooks/{id}` with `isEnabled: true`
- **AND** webhook is owned by the user
- **THEN** system updates webhook isEnabled flag to true
- **AND** webhook resumes normal operation

#### Scenario: Webhook created as enabled by default
- **WHEN** user creates new webhook
- **THEN** system sets isEnabled to true by default

#### Scenario: Get webhook shows enabled status
- **WHEN** user retrieves webhook details
- **THEN** system includes isEnabled field in response

#### Scenario: Anonymous user cannot enable/disable webhook
- **WHEN** anonymous user sends PATCH request to `/api/webhooks/{id}` with `isEnabled` value
- **THEN** system returns 403 Forbidden
- **AND** error message indicates "Authentication required"

### Requirement: Webhook claiming
The system SHALL allow anonymous users to claim ownership of their auto-created webhook when logging in.

#### Scenario: Claim unowned webhook on login
- **WHEN** user logs in from webhook detail page
- **AND** webhook has matching anonymous session and null ownerId
- **AND** user confirms they want to claim webhook
- **THEN** system updates webhook ownerId to authenticated userId
- **AND** user is redirected to management dashboard `/`

#### Scenario: Cannot claim webhook already owned
- **WHEN** user attempts to claim webhook that already has ownerId set
- **THEN** system returns 403 Forbidden with message "Webhook already owned"

#### Scenario: Get unclaimed webhook info
- **WHEN** user sends GET request to `/api/webhooks/unclaimed`
- **THEN** system returns the webhook associated with anonymous session that has null ownerId
- **AND** returns null if no unclaimed webhook exists

#### Scenario: Decline claiming webhook
- **WHEN** user logs in and is prompted to claim webhook
- **AND** user declines
- **THEN** webhook remains with null ownerId
- **AND** requests continue to be subject to 7-day soft-delete cleanup
- **AND** user is redirected to management dashboard `/`

### Requirement: Soft-delete query filtering
The system SHALL filter out soft-deleted webhooks from all queries by default.

#### Scenario: Query excludes soft-deleted webhooks
- **WHEN** system queries for webhooks
- **THEN** results exclude webhooks where `deletedAt` is not null
- **AND** only active (not soft-deleted) webhooks are returned

#### Scenario: Cannot claim soft-deleted webhook
- **WHEN** user attempts to claim webhook that has been soft-deleted
- **THEN** system returns 404 Not Found
- **AND** webhook is not claimable (it's been deleted)

