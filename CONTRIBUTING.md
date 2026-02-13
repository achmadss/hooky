# Contributing to Hooky

This guide covers how to set up and develop Hooky locally.

## Prerequisites

- [Bun](https://bun.sh/) 1.x
- [Docker](https://www.docker.com/) (optional, for PostgreSQL)

## Development Setup

### 1. Clone and Install

```bash
git clone <repo>
bun install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your DATABASE_URL and NEXTAUTH_SECRET
```

### 3. Start PostgreSQL

Option A: Use Docker (recommended)
```bash
docker compose -f docker-compose.dev.yml up -d
```

Option B: Use your own PostgreSQL instance

### 4. Run Database Migrations

```bash
bunx prisma migrate dev
```

### 5. Start Development Server

```bash
bun run dev
```

App runs at http://localhost:3000

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | required | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | required | Secret for NextAuth.js JWT signing |
| `NEXTAUTH_URL` | `http://localhost:3000` | Base URL for auth callbacks |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Public app URL (used in webhook URLs) |
| `ANONYMOUS_RETENTION_DAYS` | `7` | Days before anonymous requests are soft-deleted |
| `ANONYMOUS_SESSION_EXPIRY_DAYS` | `6` | Days before anonymous session cookie expires |
| `MAX_REQUEST_BODY_SIZE_MB` | `50` | Maximum request body size in MB |
| `CLEANUP_SCHEDULE` | `0 0 * * *` | Cron expression for cleanup job |

## Available Scripts

```bash
bun run dev          # Start development server
bun run build        # Build for production
bun run start        # Start production server
bun run lint         # Run ESLint
bun test             # Run tests (watch mode)
bun test:run         # Run tests once
bunx tsc --noEmit    # Type checking
bunx prisma studio   # Open Prisma database browser
bunx prisma migrate reset  # Reset database (dev only)
```

## Docker (PostgreSQL only)

```bash
# Start PostgreSQL
docker compose -f docker-compose.dev.yml up -d

# View logs
docker compose -f docker-compose.dev.yml logs -f

# Stop services
docker compose -f docker-compose.dev.yml down
```

## API Endpoints

### Webhook Capture
```
ANY /api/wh/:token
```
Captures any HTTP request to the webhook. Returns the configured response (default: 200 OK).

### Webhook Management
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/webhooks` | Create webhook (authenticated) |
| `GET` | `/api/webhooks` | List your webhooks (authenticated) |
| `GET` | `/api/webhooks/:id` | Get webhook details |
| `PATCH` | `/api/webhooks/:id` | Update webhook (authenticated) |
| `DELETE` | `/api/webhooks/:id` | Soft-delete webhook (authenticated) |
| `GET` | `/api/webhooks/unclaimed` | Get unclaimed anonymous webhook |
| `POST` | `/api/webhooks/claim` | Claim anonymous webhook (authenticated) |
| `GET` | `/api/webhooks/:id/response` | Get response config |
| `PUT` | `/api/webhooks/:id/response` | Update response config |
| `DELETE` | `/api/webhooks/:id/response` | Reset response to defaults |

### Authentication
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new account |
| `POST` | `/api/auth/signin` | Sign in (NextAuth.js) |

## User Flows

### Anonymous User
1. Visit `/` → system auto-creates webhook with random token
2. Redirected to `/webhooks/:id` — the request inspector
3. Send requests to `http://localhost:3000/api/wh/<token>`
4. Requests appear in real time
5. Sign up at any time to save the webhook permanently (prompted on login)

### Authenticated User
1. Visit `/` → see webhook management dashboard
2. Create webhooks with custom or auto-generated tokens
3. View request inspector at `/webhooks/:id`
4. Configure custom response per webhook
5. Enable/disable webhooks as needed
