#!/bin/sh
set -e

echo "Running database migrations..."
/usr/local/bin/bunx prisma migrate deploy

echo "Starting application..."
exec /usr/local/bin/bun run start
