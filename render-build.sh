#!/bin/bash
set -e
yarn install --frozen-lockfile
ROOT="$(pwd)"

# Generate Prisma Client
node "$ROOT/node_modules/prisma/build/index.js" generate --schema=packages/database/prisma/schema.prisma

# Build dependencies (shared, database) - force rebuild
node "$ROOT/node_modules/typescript/bin/tsc" -b --force "$ROOT/packages/shared" "$ROOT/packages/database"

# Build backend with NestJS (using project's TypeScript)
rm -rf "$ROOT/apps/backend/dist"
node "$ROOT/node_modules/typescript/bin/tsc" -p "$ROOT/apps/backend/tsconfig.json"