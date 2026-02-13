# websocket-realtime Specification

## Purpose
TBD - created by archiving change hooky. Update Purpose after archive.
## Requirements
### Requirement: Establish WebSocket connection
The system SHALL allow clients to establish a WebSocket connection to receive real-time updates.

#### Scenario: Client connects to WebSocket
- **WHEN** client opens WebSocket connection to `/ws`
- **THEN** system accepts the connection
- **AND** assigns a unique connection ID

#### Scenario: Connection with invalid protocol
- **WHEN** client attempts connection with unsupported protocol
- **THEN** system rejects the connection with appropriate error

### Requirement: Join webhook room
The system SHALL allow clients to join a specific webhook room to receive updates for that webhook.

#### Scenario: Join valid webhook room
- **WHEN** client emits "join" event with webhook ID "abc-123"
- **THEN** system adds client to room "webhook:abc-123"
- **AND** confirms join with "joined" event

#### Scenario: Join room for non-existent webhook
- **WHEN** client attempts to join room for webhook that does not exist
- **THEN** system emits "error" event with message "Webhook not found"

#### Scenario: Leave webhook room
- **WHEN** client emits "leave" event with webhook ID "abc-123"
- **THEN** system removes client from room "webhook:abc-123"
- **AND** confirms leave with "left" event

### Requirement: Broadcast new requests
The system SHALL broadcast new captured requests to all clients in the corresponding webhook room.

#### Scenario: New request broadcast
- **WHEN** system captures a new request for webhook "abc-123"
- **THEN** system emits "new-request" event to all clients in room "webhook:abc-123"
- **AND** includes the complete request data in the event payload

#### Scenario: Broadcast to multiple clients
- **WHEN** three clients are in room "webhook:abc-123"
- **AND** a new request arrives for that webhook
- **THEN** all three clients receive the "new-request" event

#### Scenario: No broadcast to other rooms
- **WHEN** client A is in room "webhook:abc-123"
- **AND** client B is in room "webhook:xyz-789"
- **AND** a new request arrives for webhook "abc-123"
- **THEN** only client A receives the "new-request" event

### Requirement: Handle client disconnections
The system SHALL gracefully handle client disconnections and clean up resources.

#### Scenario: Client disconnects
- **WHEN** client closes the WebSocket connection
- **THEN** system removes client from all rooms
- **AND** cleans up connection resources

#### Scenario: Server-initiated disconnect
- **WHEN** server needs to close connection (e.g., shutdown)
- **THEN** system sends "disconnect" event to client with reason
- **AND** gracefully closes the connection

### Requirement: Auto-reconnect support
The system SHALL support client-side auto-reconnection with exponential backoff.

#### Scenario: Server temporarily unavailable
- **WHEN** server restarts and client attempts reconnection
- **THEN** client uses exponential backoff strategy
- **AND** successfully reconnects when server is available

#### Scenario: Rejoin rooms after reconnect
- **WHEN** client reconnects after disconnection
- **AND** client had previously joined rooms "webhook:abc-123" and "webhook:xyz-789"
- **THEN** client rejoins both rooms automatically

### Requirement: Connection status events
The system SHALL emit connection status events to inform clients of their connection state.

#### Scenario: Connection established
- **WHEN** client successfully connects
- **THEN** system emits "connected" event with connection ID

#### Scenario: Connection error
- **WHEN** connection error occurs
- **THEN** system emits "connect_error" event with error details

### Requirement: Handle concurrent connections
The system SHALL support multiple concurrent WebSocket connections from different clients.

#### Scenario: Multiple concurrent clients
- **WHEN** 100 clients connect simultaneously
- **THEN** system handles all connections without degradation
- **AND** maintains separate room memberships for each client

### Requirement: Request payload structure
The system SHALL broadcast requests with a consistent payload structure.

#### Scenario: Broadcast payload format
- **WHEN** system broadcasts a new request
- **THEN** payload includes:
  - id: unique request ID
  - webhookId: ID of the webhook
  - method: HTTP method
  - headers: object with header names and values
  - queryParams: object with query parameters
  - body: request body or null
  - timestamp: ISO 8601 datetime
  - sourceIp: client IP address
  - userAgent: user agent string or null

