# Hooky — Webhook Inspector

A real-time webhook inspection tool for debugging and testing webhook integrations.

## Features

- **Instant webhook URLs** — anonymous users get a webhook endpoint immediately
- **Real-time request streaming** — new requests appear live via WebSocket
- **Request inspection** — view headers, query params, body (JSON/XML/plain), and raw HTTP
- **Custom response configuration** — set status code, headers, and body per webhook
- **Dark mode** — system preference detection with manual toggle
- **Anonymous mode** — no sign-up required; auto-deleted after 7 days
- **Authenticated mode** — persistent webhooks, management dashboard
- **Webhook claiming** — convert anonymous webhooks to your account on sign-up

## Setup

### Prerequisites

- Node.js 20+ or Bun
- PostgreSQL (or use the provided Docker Compose for development)

### Local Development

```bash
# 1. Clone and install
git clone <repo>
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL and NEXTAUTH_SECRET

# 3. Start PostgreSQL (optional — skip if using your own)
docker compose -f docker-compose.dev.yml up -d

# 4. Run database migrations
npx prisma migrate dev

# 5. Start development server
npm run dev
```

App runs at http://localhost:3000

### Environment Variables

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

## Docker Deployment

```bash
# Build and start all services
docker compose up -d

# Run migrations
docker compose exec app npx prisma migrate deploy

# View logs
docker compose logs -f app
```

The Docker setup includes:
- **app**: Next.js + Socket.io server
- **db**: PostgreSQL 16 with persistent volume

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

## Architecture

- **Framework**: Next.js 16 with App Router
- **Database**: PostgreSQL + Prisma ORM with soft-delete architecture
- **Real-time**: Socket.io (custom Node.js server)
- **Auth**: NextAuth.js (credentials provider, extensible to OAuth)
- **Cleanup**: node-cron job for anonymous data retention
- **Deployment**: Docker multi-stage build

### Soft-Delete Architecture
All data uses soft-delete (`deletedAt` timestamp). Anonymous request data is soft-deleted after 7 days via a scheduled job. Hard deletion never occurs automatically — data is recoverable.

## Development

```bash
# Type checking
npx tsc --noEmit

# Prisma Studio (database browser)
npx prisma studio

# Reset database (dev only)
npx prisma migrate reset
```
