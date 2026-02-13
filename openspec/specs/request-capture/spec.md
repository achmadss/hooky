# request-capture Specification

## Purpose
TBD - created by archiving change hooky. Update Purpose after archive.
## Requirements
### Requirement: Capture all HTTP methods
The system SHALL accept and capture all standard HTTP methods sent to webhook endpoints.

#### Scenario: Capture GET request
- **WHEN** external service sends GET request to `/api/wh/{token}`
- **THEN** system captures the request with method "GET"
- **AND** stores the complete request data

#### Scenario: Capture POST request
- **WHEN** external service sends POST request to `/api/wh/{token}`
- **THEN** system captures the request with method "POST"
- **AND** stores the complete request data

#### Scenario: Capture PUT request
- **WHEN** external service sends PUT request to `/api/wh/{token}`
- **THEN** system captures the request with method "PUT"
- **AND** stores the complete request data

#### Scenario: Capture PATCH request
- **WHEN** external service sends PATCH request to `/api/wh/{token}`
- **THEN** system captures the request with method "PATCH"
- **AND** stores the complete request data

#### Scenario: Capture DELETE request
- **WHEN** external service sends DELETE request to `/api/wh/{token}`
- **THEN** system captures the request with method "DELETE"
- **AND** stores the complete request data

#### Scenario: Capture HEAD request
- **WHEN** external service sends HEAD request to `/api/wh/{token}`
- **THEN** system captures the request with method "HEAD"
- **AND** stores the complete request data

#### Scenario: Capture OPTIONS request
- **WHEN** external service sends OPTIONS request to `/api/wh/{token}`
- **THEN** system captures the request with method "OPTIONS"
- **AND** stores the complete request data

### Requirement: Capture request headers
The system SHALL capture all HTTP headers sent with the request.

#### Scenario: Capture standard headers
- **WHEN** external service sends request with headers Content-Type, Authorization, X-Custom-Header
- **THEN** system stores all headers as a JSON object
- **AND** preserves header names in their original case

#### Scenario: Capture request with no headers
- **WHEN** external service sends request with no headers
- **THEN** system stores an empty headers object

### Requirement: Capture query parameters
The system SHALL capture all query parameters from the request URL.

#### Scenario: Capture single query parameter
- **WHEN** external service sends request to `/api/wh/{token}?foo=bar`
- **THEN** system stores query parameters as `{ "foo": "bar" }`

#### Scenario: Capture multiple query parameters
- **WHEN** external service sends request to `/api/wh/{token}?foo=bar&baz=qux`
- **THEN** system stores query parameters as `{ "foo": "bar", "baz": "qux" }`

#### Scenario: Capture array query parameters
- **WHEN** external service sends request to `/api/wh/{token}?tag=a&tag=b`
- **THEN** system stores query parameters as `{ "tag": ["a", "b"] }`

#### Scenario: Capture request with no query parameters
- **WHEN** external service sends request to `/api/wh/{token}` without query string
- **THEN** system stores an empty query parameters object

### Requirement: Capture request body
The system SHALL capture the request body for applicable HTTP methods.

#### Scenario: Capture JSON body
- **WHEN** external service sends POST request with JSON body `{"key": "value"}`
- **THEN** system stores the body as a string
- **AND** preserves the original formatting

#### Scenario: Capture form data body
- **WHEN** external service sends POST request with form data `key=value&foo=bar`
- **THEN** system stores the body as a string

#### Scenario: Capture XML body
- **WHEN** external service sends POST request with XML body `<root><item>value</item></root>`
- **THEN** system stores the body as a string

#### Scenario: Capture request with no body
- **WHEN** external service sends GET request with no body
- **THEN** system stores null for the body field

### Requirement: Request body size limit
The system SHALL enforce a maximum request body size of 50 MB.

#### Scenario: Accept request within size limit
- **WHEN** external service sends POST request with body size of 49 MB
- **THEN** system accepts and stores the request body

#### Scenario: Reject request exceeding size limit
- **WHEN** external service sends POST request with body size of 51 MB
- **THEN** system returns 413 Payload Too Large
- **AND** does not store any request data
- **AND** response includes message "Request body too large. Maximum size is 50 MB."

#### Scenario: Accept request at exact size limit
- **WHEN** external service sends POST request with body size of exactly 50 MB
- **THEN** system accepts and stores the request body

### Requirement: Text-only request body support
The system SHALL only support text-based request bodies. Binary request bodies must be rejected.

#### Scenario: Accept text-based body types
- **WHEN** external service sends request with Content-Type "application/json"
- **OR** Content-Type "application/xml"
- **OR** Content-Type "text/plain"
- **OR** Content-Type "application/x-www-form-urlencoded"
- **THEN** system accepts and stores the body as text

#### Scenario: Accept request without Content-Type header
- **WHEN** external service sends request without Content-Type header
- **AND** body is text-based
- **THEN** system attempts to parse and store body as text

#### Scenario: Reject binary Content-Type
- **WHEN** external service sends request with binary Content-Type (e.g., "image/jpeg", "image/png", "application/pdf", "video/mp4")
- **THEN** system returns 415 Unsupported Media Type
- **AND** response includes message "Binary content types are not supported. Please send text-based content only."
- **AND** does not store any request data

#### Scenario: Reject binary content based on Content-Type prefix
- **WHEN** external service sends request with Content-Type starting with "image/", "video/", "audio/", or "application/octet-stream"
- **THEN** system returns 415 Unsupported Media Type
- **AND** does not process the request

### Requirement: Capture metadata
The system SHALL capture request metadata including timestamp, source IP, and user agent.

#### Scenario: Capture timestamp
- **WHEN** external service sends request at 2024-01-15T10:30:00Z
- **THEN** system stores the timestamp as ISO 8601 formatted datetime

#### Scenario: Capture source IP
- **WHEN** external service sends request from IP 192.168.1.100
- **THEN** system stores the source IP address
- **AND** correctly handles IPv4 and IPv6 addresses

#### Scenario: Capture user agent
- **WHEN** external service sends request with User-Agent header "Mozilla/5.0..."
- **THEN** system extracts and stores the user agent string

#### Scenario: Capture request without user agent
- **WHEN** external service sends request without User-Agent header
- **THEN** system stores null for the user agent field

### Requirement: Validate webhook token and status
The system SHALL validate that the webhook token exists and is enabled before capturing the request.

#### Scenario: Request to valid enabled webhook
- **WHEN** external service sends request to `/api/wh/{valid-enabled-token}`
- **THEN** system captures and stores the request
- **AND** returns the configured response

#### Scenario: Request to invalid webhook
- **WHEN** external service sends request to `/api/wh/{invalid-token}`
- **THEN** system returns a 404 Not Found response
- **AND** does not store any request data

#### Scenario: Request to disabled webhook
- **WHEN** external service sends request to `/api/wh/{disabled-token}`
- **THEN** system returns a 404 Not Found response
- **AND** does not store any request data
- **AND** does not broadcast to WebSocket rooms

### Requirement: Persist captured requests
The system SHALL persist all captured requests to the database.

#### Scenario: Request successfully persisted
- **WHEN** system captures a valid request
- **THEN** the request is stored in the database within 100ms
- **AND** includes all captured fields: id, webhookId, method, headers, queryParams, body, timestamp, sourceIp, userAgent

#### Scenario: Request persistence failure
- **WHEN** database is unavailable during request capture
- **THEN** system returns a 500 Internal Server Error
- **AND** does not send a success response to the external service

### Requirement: Automatic soft-delete cleanup for anonymous webhooks
The system SHALL automatically soft-delete request data for anonymous webhooks after a retention period.

#### Scenario: Cleanup job soft-deletes old anonymous requests
- **WHEN** cleanup job runs and finds requests older than 7 days
- **AND** requests belong to webhooks with null ownerId
- **THEN** system sets `deletedAt` timestamp on those request records
- **AND** requests are hidden from UI but remain in database
- **AND** preserves webhook metadata and configuration

#### Scenario: Cleanup job preserves authenticated webhook requests
- **WHEN** cleanup job runs and finds requests older than 7 days
- **AND** requests belong to webhooks with non-null ownerId
- **THEN** system preserves those request records (no soft-delete applied)

#### Scenario: Cleanup job preserves recent anonymous requests
- **WHEN** cleanup job runs and finds requests less than 7 days old
- **AND** requests belong to anonymous webhooks
- **THEN** system preserves those request records (no soft-delete applied)

#### Scenario: Cleanup job logs activity
- **WHEN** cleanup job completes
- **THEN** system logs number of requests soft-deleted
- **AND** logs any errors encountered

### Requirement: Soft-delete query filtering
The system SHALL filter out soft-deleted requests from all queries by default.

#### Scenario: Query excludes soft-deleted requests
- **WHEN** system queries for requests in a webhook
- **THEN** results exclude requests where `deletedAt` is not null
- **AND** only active (not soft-deleted) requests are returned

#### Scenario: Soft-deleted requests hidden from UI
- **WHEN** user views request list for a webhook
- **THEN** soft-deleted requests are not displayed
- **AND** user sees only active requests

### Requirement: Cleanup job scheduling
The system SHALL run the cleanup job on a scheduled basis.

#### Scenario: Daily cleanup execution
- **WHEN** system time matches scheduled cleanup time (default: midnight UTC)
- **THEN** cleanup job executes automatically

#### Scenario: Configurable cleanup schedule
- **WHEN** environment variable CLEANUP_SCHEDULE is set
- **THEN** system uses that cron expression for scheduling
- **AND** defaults to daily at midnight if not set

