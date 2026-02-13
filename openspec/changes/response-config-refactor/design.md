## Context

The current ResponseConfigPanel uses simple text inputs:
- Status code: plain number input
- Response body: plain textarea
- No syntax highlighting or formatting

Users need a more user-friendly interface for configuring webhook responses.

## Goals / Non-Goals

**Goals:**
- Replace status code number input with dropdown (e.g., "200 OK", "201 Created")
- Add code editor with syntax highlighting for response body
- Support JSON, XML, and plain text content types
- Add formatting button to auto-format JSON/XML

**Non-Goals:**
- Backend API changes - already stores content type
- Multiple response configurations (future feature)
- Response templates/predefined responses (future feature)

## Decisions

1. **Code Editor Library**: Use @monaco-editor/react (VS Code's editor)
   - Monaco is the most feature-rich (VS Code experience)
   - Alternatives: CodeMirror (lighter), Ace (older)
   - Monaco provides best DX with familiar VS Code features

2. **Status Code Options**: All HTTP status codes (100-599) in dropdown
   - Default: 200 OK
   - Full list: 100 Continue, 101 Switching Protocols, etc. through 599 Network Connect Timeout Error
   - Each option shows code + description (e.g., "200 OK", "404 Not Found")
   - No custom option needed since all codes are available

3. **Content Types Supported**:
   - application/json (default)
   - application/xml
   - text/plain
   - text/html

4. **Editor Features**:
   - Syntax highlighting per content type
   - Tab key inserts spaces (2 spaces)
   - Format button for JSON/XML
   - Line numbers
   - Minimap disabled (save space)

## Risks / Trade-offs

- [Risk] Monaco editor bundle size is large (~2MB)
  - Mitigation: Use dynamic import to load only when response tab is active
  
- [Risk] JSON formatting may fail on invalid JSON
  - Mitigation: Catch errors and show toast notification, don't crash

- [Risk] Editor may be overkill for simple plaintext responses
  - Mitigation: Use different theme/minimal mode for plain text
