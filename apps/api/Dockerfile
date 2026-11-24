# syntax=docker/dockerfile:1
# =============================================================================
# apps/api — NestJS REST API (Firebase Admin + Supabase; no local databases)
# Build context MUST be the monorepo root:
#   docker build -f apps/api/Dockerfile .
# NOTE: This replaces the legacy apps/api/docker/Dockerfile (Node 20 + npm +
# Prisma + postgres sidecar), which no longer matches the current stack.
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Builder — pnpm workspace build of @webastro/api
# -----------------------------------------------------------------------------
FROM node:26-alpine AS builder

WORKDIR /repo

# pnpm pinned to the version declared in root package.json "packageManager"
RUN npm install --global pnpm@10.28.2

# Copy manifests first to maximize layer cache
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/shared-types/package.json packages/shared-types/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/admin/package.json apps/admin/package.json
COPY apps/api/package.json apps/api/package.json

# Install only the dependency subtree needed by api (frozen lockfile)
RUN pnpm install --frozen-lockfile --filter @webastro/api...

# Copy sources and build (nest build -> apps/api/dist)
COPY packages/shared-types packages/shared-types
COPY apps/api apps/api

RUN pnpm --filter @webastro/api build

# -----------------------------------------------------------------------------
# Stage 2: Production dependencies — only what the API needs at runtime
# -----------------------------------------------------------------------------
FROM node:26-alpine AS deps-prod

WORKDIR /repo
RUN npm install --global pnpm@10.28.2

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/shared-types/package.json packages/shared-types/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/admin/package.json apps/admin/package.json
COPY apps/api/package.json apps/api/package.json

RUN pnpm install --frozen-lockfile --prod --filter @webastro/api...

# -----------------------------------------------------------------------------
# Stage 3: Runner — Node process (non-root)
# -----------------------------------------------------------------------------
# Same workspace layout rationale as apps/admin: app-level node_modules hold
# relative symlinks into the root .pnpm store.
FROM node:26-alpine AS runner

ENV NODE_ENV=production \
    PORT=3000

# Root pnpm store (production deps only)
COPY --from=deps-prod --chown=node:node /repo/node_modules /repo/node_modules

# App-level prod deps (symlinks into ../node_modules/.pnpm)
COPY --from=deps-prod --chown=node:node /repo/apps/api/node_modules /repo/apps/api/node_modules

# Compiled output
COPY --from=builder --chown=node:node /repo/apps/api/dist /repo/apps/api/dist

# Manifests kept for runtime package resolution metadata
COPY --chown=node:node apps/api/package.json /repo/apps/api/package.json
COPY --chown=node:node package.json /repo/package.json

USER node

WORKDIR /repo/apps/api

EXPOSE 3000

# No migrations: Firestore and Supabase are managed external services.
CMD ["node", "dist/main.js"]
