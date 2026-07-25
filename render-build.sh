#!/bin/bash
set -e
yarn install --frozen-lockfile
export PATH="$(pwd)/node_modules/.bin:$PATH"
prisma generate --schema=packages/database/prisma/schema.prisma
turbo run build --filter=@rentcar/backend
