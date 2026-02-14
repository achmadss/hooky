# webhook-visibility Specification

## Purpose
Controls who can view webhook details - public or private.

## ADDED Requirements

### Requirement: Webhook visibility can be set to public or private
Webhook owners SHALL be able to set their webhook's visibility to either `public` or `private`. The default visibility SHALL be `private`.

#### Scenario: Create webhook with public visibility
- **WHEN** authenticated user creates a webhook with `visibility: "public"`
- **THEN** the webhook is created with visibility set to `public`
- **AND** the webhook detail page is accessible by anyone

#### Scenario: Create webhook with private visibility
- **WHEN** authenticated user creates a webhook with `visibility: "private"` or omits visibility
- **THEN** the webhook is created with visibility set to `private`
- **AND** only the owner can access the webhook detail page

#### Scenario: Update webhook visibility to public
- **WHEN** webhook owner updates a webhook's visibility to `public`
- **THEN** the webhook visibility is updated to `public`
- **AND** the webhook detail page becomes accessible to anyone

#### Scenario: Update webhook visibility to private
- **WHEN** webhook owner updates a webhook's visibility to `private`
- **THEN** the webhook visibility is updated to `private`
- **AND** the webhook detail page returns 404 for non-owners

### Requirement: Public webhooks are viewable by anyone
When a webhook has visibility set to `public`, the webhook detail page SHALL be accessible by any user (authenticated or anonymous).

#### Scenario: Anonymous user views public webhook
- **WHEN** anonymous user visits `/webhooks/[id]` for a public webhook
- **THEN** the user sees the webhook details, URL, and request history
- **AND** copy button is visible

#### Scenario: Authenticated user views public webhook they don't own
- **WHEN** authenticated user visits `/webhooks/[id]` for a public webhook they don't own
- **THEN** the user sees the webhook details, URL, and request history
- **AND** edit/delete/toggle buttons are not visible (only owner can modify)

### Requirement: Private webhooks are viewable only by owner
When a webhook has visibility set to `private`, only the owner (or anonymous owner for session-based webhooks) can view the detail page.

#### Scenario: Anonymous user views private webhook
- **WHEN** anonymous user visits `/webhooks/[id]` for a private webhook they don't own
- **THEN** the user receives a 404 (not found) response

#### Scenario: Authenticated user views private webhook they don't own
- **WHEN** authenticated user visits `/webhooks/[id]` for a private webhook they don't own
- **THEN** the user receives a 404 (not found) response

#### Scenario: Owner views their private webhook
- **WHEN** webhook owner visits `/webhooks/[id]` for their private webhook
- **THEN** the user sees the webhook details, URL, request history
- **AND** edit/delete/toggle buttons are visible

### Requirement: Webhook endpoint remains accessible regardless of visibility
The webhook endpoint (`/api/wh/[token]`) SHALL continue to accept requests regardless of the webhook's visibility setting. Only the detail page access is affected.

#### Scenario: Request to public webhook endpoint
- **WHEN** a POST request is sent to `/api/wh/[token]` for a public webhook
- **THEN** the request is captured and stored normally

#### Scenario: Request to private webhook endpoint
- **WHEN** a POST request is sent to `/api/wh/[token]` for a private webhook
- **THEN** the request is captured and stored normally (endpoint always works)
