# Specification: Drizzle Integration

## ADDED Requirements

### Requirement: Drizzle Schema Definition

Define Drizzle schema matching existing Prisma models with soft delete support.

#### Scenario: Create User Table Schema

- **WHEN** defining the users table
- **THEN** include columns: id (uuid), email (unique), passwordHash (nullable), createdAt, updatedAt, deletedAt
- **AND** map to table name "users"

#### Scenario: Create Webhook Table Schema

- **WHEN** defining the webhooks table
- **THEN** include columns: id (uuid), token (unique), name (nullable), isEnabled (boolean, default true), ownerId (uuid, nullable), sessionId (nullable), createdAt, updatedAt, deletedAt
- **AND** map to table name "webhooks"
- **AND** add foreign key to users table

#### Scenario: Create Request Table Schema

- **WHEN** defining the requests table
- **THEN** include columns: id (uuid), webhookId (uuid), webhookToken (string), method (string), headers (json), queryParams (json), body (text, nullable), timestamp (timestamp), sourceIp (string), userAgent (nullable), deletedAt
- **AND** map to table name "requests"

#### Scenario: Create ResponseConfig Table Schema

- **WHEN** defining the response_configs table
- **THEN** include columns: id (uuid), webhookId (uuid, unique), statusCode (integer, default 200), headers (json, default {}), body (text, nullable), contentType (string, default application/json), createdAt, updatedAt, deletedAt
- **AND** map to table name "response_configs"

## MODIFIED Requirements

### Requirement: Database Connection

Update database connection to use Drizzle instead of Prisma.

#### Scenario: Initialize Drizzle Client

- **WHEN** the application starts
- **THEN** create a Drizzle client using the PostgreSQL driver
- **AND** read connection string from DATABASE_URL environment variable
