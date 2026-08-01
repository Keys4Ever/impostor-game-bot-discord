#!/bin/sh
set -e

mkdir -p /app/data
npx prisma db push --skip-generate --accept-data-loss=false
exec node dist/index.js
