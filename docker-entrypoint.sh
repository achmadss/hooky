#!/bin/sh
set -e

echo "Running database migrations..."
/usr/local/bin/bunx drizzle-kit migrate

echo "Starting application..."
exec /usr/local/bin/bun run start
