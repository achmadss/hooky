#!/bin/sh
set -e

echo "Pushing database schema..."
bun prisma db push

echo "Starting Next.js dev server..."
exec bun dev
