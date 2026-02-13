# response-configuration Specification

## Purpose
TBD - created by archiving change hooky. Update Purpose after archive.
## Requirements
### Requirement: Default response behavior
The system SHALL return a default response when no custom response is configured.

#### Scenario: Default response for new webhook
- **WHEN** external service sends request to webhook with no custom response configured
- **THEN** system returns HTTP 200 OK
- **AND** response body is empty
- **AND** Content-Type header is "text/plain"

#### Scenario: Default response for all HTTP methods
- **WHEN** external service sends GET, POST, PUT, PATCH, DELETE, HEAD, or OPTIONS request
- **AND** no custom response is configured
- **THEN** system returns HTTP 200 OK for all methods

### Requirement: Configure custom status code
The system SHALL allow users to set a custom HTTP status code for webhook responses.

#### Scenario: Set success status code
- **WHEN** user configures webhook response with status code 201
- **AND** external service sends request to that webhook
- **THEN** system returns HTTP 201 Created

#### Scenario: Set redirect status code
- **WHEN** user configures webhook response with status code 302
- **AND** external service sends request to that webhook
- **THEN** system returns HTTP 302 Found

#### Scenario: Set error status code
- **WHEN** user configures webhook response with status code 500
- **AND** external service sends request to that webhook
- **THEN** system returns HTTP 500 Internal Server Error

#### Scenario: Invalid status code validation
- **WHEN** user attempts to configure status code 999
- **THEN** system returns 400 Bad Request with error "Invalid HTTP status code"

### Requirement: Configure custom headers
The system SHALL allow users to define custom response headers.

#### Scenario: Set single header
- **WHEN** user configures webhook response with header "X-Custom: value"
- **AND** external service sends request to that webhook
- **THEN** system includes "X-Custom: value" in response headers

#### Scenario: Set multiple headers
- **WHEN** user configures webhook response with headers "Content-Type: application/json" and "X-Rate-Limit: 100"
- **AND** external service sends request to that webhook
- **THEN** system includes both headers in response

#### Scenario: Override default Content-Type
- **WHEN** user configures webhook response with Content-Type "application/json"
- **THEN** system returns Content-Type "application/json" instead of default "text/plain"

### Requirement: Configure custom response body
The system SHALL allow users to define a custom response body.

#### Scenario: Set JSON body
- **WHEN** user configures webhook response with body `{"status": "ok"}`
- **AND** external service sends request to that webhook
- **THEN** system returns the JSON body in the response

#### Scenario: Set plain text body
- **WHEN** user configures webhook response with body "Webhook received"
- **AND** external service sends request to that webhook
- **THEN** system returns "Webhook received" in the response body

#### Scenario: Set XML body
- **WHEN** user configures webhook response with body `<response><status>ok</status></response>`
- **AND** external service sends request to that webhook
- **THEN** system returns the XML body in the response

#### Scenario: Empty body
- **WHEN** user configures webhook response with empty body
- **AND** external service sends request to that webhook
- **THEN** system returns response with empty body

### Requirement: Retrieve response configuration
The system SHALL allow users to retrieve the current response configuration for a webhook.

#### Scenario: Get existing response config
- **WHEN** user sends GET request to `/api/webhooks/{id}/response`
- **THEN** system returns the response configuration including statusCode, headers, and body

#### Scenario: Get default response config
- **WHEN** user sends GET request to `/api/webhooks/{id}/response` for webhook with no custom config
- **THEN** system returns default configuration (statusCode: 200, headers: {}, body: null)

### Requirement: Update response configuration
The system SHALL allow users to update the response configuration for a webhook.

#### Scenario: Update full configuration
- **WHEN** user sends PUT request to `/api/webhooks/{id}/response` with statusCode, headers, and body
- **THEN** system updates or creates the response configuration
- **AND** returns the updated configuration

#### Scenario: Partial update
- **WHEN** user sends PUT request to `/api/webhooks/{id}/response` with only statusCode
- **THEN** system updates only the statusCode
- **AND** preserves existing headers and body values

#### Scenario: Update non-existent webhook
- **WHEN** user sends PUT request to `/api/webhooks/{id}/response` for webhook that does not exist
- **THEN** system returns 404 Not Found

### Requirement: Delete response configuration
The system SHALL allow users to delete custom response configuration, reverting to defaults.

#### Scenario: Delete custom response config
- **WHEN** user sends DELETE request to `/api/webhooks/{id}/response`
- **THEN** system deletes the custom response configuration
- **AND** subsequent requests receive default 200 OK response

#### Scenario: Delete non-existent config
- **WHEN** user sends DELETE request to `/api/webhooks/{id}/response` for webhook with no custom config
- **THEN** system returns 204 No Content (idempotent operation)

### Requirement: Response configuration persistence
The system SHALL persist response configurations to the database.

#### Scenario: Configuration survives restart
- **WHEN** user configures custom response
- **AND** application restarts
- **THEN** the custom response configuration is still active

