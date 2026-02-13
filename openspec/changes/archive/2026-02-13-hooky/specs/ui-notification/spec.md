# Capability: UI Notification

## Purpose

UI Notification provides a system for displaying toast notifications to give users feedback on their actions.

## Requirements

### Requirement: Toast notification display
The system SHALL display toast notifications in the top-right area of the screen, below the navbar, to provide user feedback for actions.

#### Scenario: Show success notification
- **WHEN** user copies a webhook URL
- **THEN** a success toast appears below the navbar in the top-right corner
- **AND** the toast auto-dismisses after 3 seconds

#### Scenario: Show error notification
- **WHEN** an error occurs during an action
- **THEN** an error toast appears below the navbar
- **AND** the toast displays the error message
- **AND** the toast auto-dismisses after 5 seconds

### Requirement: Toast notification types
The system SHALL support different toast types: success, error, warning, and info.

#### Scenario: Success toast styling
- **WHEN** a success toast is displayed
- **THEN** it SHALL have green accent color
- **AND** display a checkmark icon

#### Scenario: Error toast styling
- **WHEN** an error toast is displayed
- **THEN** it SHALL have red accent color
- **AND** display an error/alert icon
