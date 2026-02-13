# Hooky — Webhook Inspector

A real-time webhook inspection tool for debugging and testing webhook integrations. Capture, inspect, and debug webhooks with instant URLs, live request streaming, and customizable responses.

## Features

- **Instant webhook URLs** — anonymous users get a webhook endpoint immediately
- **Real-time request streaming** — new requests appear live via WebSocket
- **Request inspection** — view headers, query params, body (JSON/XML/plain), and raw HTTP
- **Custom response configuration** — set status code, headers, and body per webhook
- **Dark mode** — system preference detection with manual toggle
- **Anonymous mode** — no sign-up required; auto-deleted after 7 days
- **Authenticated mode** — persistent webhooks, management dashboard
- **Webhook claiming** — convert anonymous webhooks to your account on sign-up

## Quickstart

Deploy with Docker in under 5 minutes:

```bash
# 1. Download docker-compose.yml from GitHub
curl -o docker-compose.yml https://raw.githubusercontent.com/achmadss/hooky/main/docker-compose.yml

# 2. Create .env file
cat > .env << EOF
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=hooky
DATABASE_URL=postgresql://postgres:your_secure_password@db:5432/hooky
NEXTAUTH_SECRET=your_generated_secret
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF

# 3. Pull and start
docker compose up -d

# 4. Visit http://localhost:3000
```

That's it! Migrations run automatically on startup.

### Docker Hub

Pre-built images available at [Docker Hub](https://hub.docker.com/r/novan921/hooky):

```bash
docker pull novan921/hooky:latest
```

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

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup guide.
