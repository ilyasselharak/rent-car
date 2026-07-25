#!/bin/bash
set -e
yarn install --frozen-lockfile
ROOT="$(pwd)"

# Generate Prisma Client
node "$ROOT/node_modules/prisma/build/index.js" generate --schema=packages/database/prisma/schema.prisma

# Build dependencies (shared, database)
node "$ROOT/node_modules/typescript/bin/tsc" -b "$ROOT/packages/shared" "$ROOT/packages/database"

# Build backend with NestJS
cd "$ROOT/apps/backend"
npx --yes -p @nestjs/cli nest build
