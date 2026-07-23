# Multi-stage Dockerfile for RentCar Enterprise
# Stage 1: Dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json yarn.lock turbo.json ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/
COPY packages/config/tsconfig/package.json ./packages/config/tsconfig/
COPY packages/config/eslint/package.json ./packages/config/eslint/
COPY packages/config/tailwind/package.json ./packages/config/tailwind/
RUN yarn install --frozen-lockfile

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn db:generate
RUN yarn build

# Stage 3: Production - Backend
FROM node:20-alpine AS backend
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
EXPOSE 4000
CMD ["node", "dist/main"]

# Stage 4: Production - Frontend
FROM node:20-alpine AS frontend
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/frontend/.next/standalone ./
COPY --from=builder /app/apps/frontend/.next/static ./.next/static
COPY --from=builder /app/apps/frontend/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
