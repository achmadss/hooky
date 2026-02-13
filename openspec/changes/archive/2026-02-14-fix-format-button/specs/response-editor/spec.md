# Capability: Response Editor

## Purpose

Response Editor provides a code editor interface for configuring webhook response body with syntax highlighting, formatting, and content type selection.

## Requirements

### Requirement: Status code dropdown
The system SHALL provide a dropdown for selecting all HTTP status codes (100-599) with human-readable labels.

#### Scenario: Select status code from dropdown
- **WHEN** user clicks the status code dropdown
- **THEN** a list of all status codes (100-599) is displayed with labels (e.g., "200 OK", "404 Not Found")
- **AND** default selection is 200 OK

### Requirement: Code editor for response body
The system SHALL provide a code editor for editing response body with syntax highlighting.

#### Scenario: Edit JSON response body
- **WHEN** content type is set to JSON
- **THEN** the editor displays JSON syntax highlighting
- **AND** pressing Tab inserts 2 spaces

#### Scenario: Edit XML response body
- **WHEN** content type is set to XML
- **THEN** the editor displays XML syntax highlighting

#### Scenario: Edit plain text response body
- **WHEN** content type is set to Plain text
- **THEN** the editor displays plain text without syntax highlighting

### Requirement: Format response body
The system SHALL provide a button to auto-format the response body based on the selected content type.

#### Scenario: Format valid JSON
- **WHEN** user clicks the Format button with content type set to JSON and valid JSON content
- **THEN** the JSON is formatted with proper indentation

#### Scenario: Format invalid JSON
- **WHEN** user clicks the Format button with content type set to JSON and invalid JSON content
- **THEN** an error notification is displayed
- **AND** the content remains unchanged

#### Scenario: Format valid XML
- **WHEN** user clicks the Format button with content type set to XML and valid XML content
- **THEN** the XML is formatted with proper indentation

#### Scenario: Format invalid XML
- **WHEN** user clicks the Format button with content type set to XML and invalid XML content
- **THEN** an error notification is displayed
- **AND** the content remains unchanged

#### Scenario: Format valid HTML
- **WHEN** user clicks the Format button with content type set to HTML and valid HTML content
- **THEN** the HTML is formatted with proper indentation

#### Scenario: Format invalid HTML
- **WHEN** user clicks the Format button with content type set to HTML and invalid HTML content
- **THEN** an error notification is displayed
- **AND** the content remains unchanged

#### Scenario: Format plain text
- **WHEN** user clicks the Format button with content type set to Plain text
- **THEN** a message is displayed indicating plain text cannot be formatted
- **AND** the content remains unchanged

### Requirement: Content type selection
The system SHALL allow users to select the response content type.

#### Scenario: Change content type
- **WHEN** user selects a different content type from dropdown
- **THEN** the editor syntax highlighting updates accordingly

### Requirement: Line numbers
The system SHALL display line numbers in the code editor.

#### Scenario: View line numbers
- **WHEN** the editor has content
- **THEN** line numbers are displayed on the left side
