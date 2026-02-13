# Capability: Webhook Detail Management

## Purpose

Webhook Detail Management provides authenticated owners with the ability to edit, toggle, and delete webhooks directly from the webhook detail page.

## Requirements

### Requirement: Webhook detail page management
Authenticated users who own a webhook SHALL be able to edit, toggle, and delete the webhook from the detail page.

#### Scenario: Toggle webhook enabled/disabled
- **WHEN** authenticated owner clicks the toggle button in the detail page
- **THEN** a confirmation modal appears asking to confirm the action
- **AND** upon confirmation, the webhook's enabled state is toggled
- **AND** user receives success notification

#### Scenario: Delete webhook from detail page
- **WHEN** authenticated owner clicks the delete button in the detail page
- **THEN** a confirmation modal appears with warning text
- **AND** upon confirmation, the webhook is soft-deleted
- **AND** user is redirected to the dashboard

#### Scenario: Edit webhook name
- **WHEN** authenticated owner clicks the edit button in the detail page
- **THEN** an inline edit field appears with the current name
- **AND** user can modify the name and save
- **AND** user receives success notification upon save

### Requirement: Management controls visibility
Management controls in webhook detail page SHALL only be visible to authenticated users who own the webhook.

#### Scenario: Anonymous user cannot see controls
- **WHEN** an anonymous user visits a webhook detail page
- **THEN** the edit, toggle, and delete buttons SHALL NOT be visible

#### Scenario: Non-owner authenticated user cannot see controls
- **WHEN** an authenticated user visits a webhook they don't own
- **THEN** the edit, toggle, and delete buttons SHALL NOT be visible
