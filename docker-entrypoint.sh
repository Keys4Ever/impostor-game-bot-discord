#!/bin/sh
set -e

mkdir -p /app/data
npx prisma db push --skip-generate --accept-data-loss=false
node dist/scripts/deploy-commands.js
exec node dist/index.js
