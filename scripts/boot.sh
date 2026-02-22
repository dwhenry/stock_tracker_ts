#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/.."

echo "==> Running migrations..."
npm run db:migrate

echo "==> Seeding database..."
npm run db:seed

# Build when NODE_ENV=production or RUN_BUILD=1 (e.g. for production deploy)
if [ "${NODE_ENV:-}" = "production" ] || [ "${RUN_BUILD:-0}" = "1" ]; then
  echo "==> Building application..."
  npm run build
fi

echo "==> Starting application..."
npm run start
