## MODIFIED Requirements

### Requirement: Anonymous webhook auto-creation
**Updated Description**: The system SHALL auto-create a webhook for anonymous users when they click "Try Now" on homepage (not on homepage visit).

#### Scenario: Anonymous user clicks Try Now with no existing webhook
- **WHEN** anonymous user clicks "Try Now" button on homepage
- **AND** user has no existing webhook associated with session
- **THEN** system generates a unique 16-character alphanumeric token
- **AND** system creates a new webhook record with ownerId set to null
- **AND** system associates webhook with anonymous session
- **AND** system redirects to `/webhooks/{webhookId}`

#### Scenario: Anonymous user clicks Try Now with existing webhook
- **WHEN** anonymous user clicks "Try Now" button on homepage
- **AND** user already has a webhook associated with session
- **THEN** system redirects to existing webhook detail page `/webhooks/{existingWebhookId}`
- **AND** does not create a new webhook

**Reason**: Changed from automatic creation on homepage visit to on-demand creation via "Try Now" button.

**Migration**: Homepage no longer auto-creates webhooks. Use "Try Now" button to create/assign webhook.
