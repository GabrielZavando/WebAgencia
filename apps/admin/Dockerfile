# syntax=docker/dockerfile:1
# =============================================================================
# apps/admin — Astro SSR panel (output: 'server', @astrojs/node standalone)
# Build context MUST be the monorepo root:
#   docker build -f apps/admin/Dockerfile .
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Builder — pnpm workspace build of @webastro/admin
# -----------------------------------------------------------------------------
FROM node:26-alpine AS builder

WORKDIR /repo

# pnpm pinned to the version declared in root package.json "packageManager"
RUN npm install --global pnpm@10.28.2

# PUBLIC_* are read by Astro at build time (client bundles inline them)
ARG PUBLIC_API_URL=""
ARG PUBLIC_SITE_URL=""
ARG PUBLIC_TURNSTILE_SITE_KEY=""
ARG PUBLIC_GTM_ID=""
ARG PUBLIC_FIREBASE_API_KEY=""
ARG PUBLIC_FIREBASE_AUTH_DOMAIN=""
ARG PUBLIC_FIREBASE_PROJECT_ID=""
ARG PUBLIC_FIREBASE_STORAGE_BUCKET=""
ARG PUBLIC_FIREBASE_MESSAGING_SENDER_ID=""
ARG PUBLIC_FIREBASE_APP_ID=""
ARG PUBLIC_FIREBASE_MEASUREMENT_ID=""
ENV PUBLIC_API_URL=$PUBLIC_API_URL \
    PUBLIC_SITE_URL=$PUBLIC_SITE_URL \
    PUBLIC_TURNSTILE_SITE_KEY=$PUBLIC_TURNSTILE_SITE_KEY \
    PUBLIC_GTM_ID=$PUBLIC_GTM_ID \
    PUBLIC_FIREBASE_API_KEY=$PUBLIC_FIREBASE_API_KEY \
    PUBLIC_FIREBASE_AUTH_DOMAIN=$PUBLIC_FIREBASE_AUTH_DOMAIN \
    PUBLIC_FIREBASE_PROJECT_ID=$PUBLIC_FIREBASE_PROJECT_ID \
    PUBLIC_FIREBASE_STORAGE_BUCKET=$PUBLIC_FIREBASE_STORAGE_BUCKET \
    PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$PUBLIC_FIREBASE_MESSAGING_SENDER_ID \
    PUBLIC_FIREBASE_APP_ID=$PUBLIC_FIREBASE_APP_ID \
    PUBLIC_FIREBASE_MEASUREMENT_ID=$PUBLIC_FIREBASE_MEASUREMENT_ID

# Copy manifests first to maximize layer cache
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/shared-types/package.json packages/shared-types/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/admin/package.json apps/admin/package.json
COPY apps/api/package.json apps/api/package.json

# Install only the dependency subtree needed by admin (frozen lockfile)
RUN pnpm install --frozen-lockfile --filter @webastro/admin...

# Copy sources and build shared-types first, then the SSR panel
COPY packages/shared-types packages/shared-types
COPY apps/admin apps/admin

RUN pnpm --filter @webastro/shared-types build \
    && pnpm --filter @webastro/admin build

# -----------------------------------------------------------------------------
# Stage 2: Production dependencies — only what the SSR server needs at runtime
# -----------------------------------------------------------------------------
FROM node:26-alpine AS deps-prod

WORKDIR /repo
RUN npm install --global pnpm@10.28.2

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY packages/shared-types/package.json packages/shared-types/package.json
COPY apps/web/package.json apps/web/package.json
COPY apps/admin/package.json apps/admin/package.json
COPY apps/api/package.json apps/api/package.json

RUN pnpm install --frozen-lockfile --prod --filter @webastro/admin...

# -----------------------------------------------------------------------------
# Stage 3: Runner — Node standalone server (non-root)
# -----------------------------------------------------------------------------
# The runner replicates the pnpm workspace layout: apps/admin/node_modules holds
# relative symlinks into the root .pnpm store, so both trees must be present and
# the entrypoint must run from apps/admin for module resolution to work.
FROM node:26-alpine AS runner

ENV NODE_ENV=production \
    PORT=4321 \
    HOST=0.0.0.0 \
    ASTRO_NODE_LOGGING=disabled

# Root pnpm store (production deps only)
COPY --from=deps-prod --chown=node:node /repo/node_modules /repo/node_modules

# App-level prod deps (symlinks into ../node_modules/.pnpm)
COPY --from=deps-prod --chown=node:node /repo/apps/admin/node_modules /repo/apps/admin/node_modules

# Built SSR artifact (dist/server/entry.mjs + dist/client)
COPY --from=builder --chown=node:node /repo/apps/admin/dist /repo/apps/admin/dist

# Manifests kept for runtime package resolution metadata
COPY --chown=node:node apps/admin/package.json /repo/apps/admin/package.json
COPY --chown=node:node package.json /repo/package.json

# Workspace package sources for relative symlinks
# (apps/admin/node_modules/@webastro/shared-types -> ../../packages/shared-types)
COPY --from=builder --chown=node:node /repo/packages/shared-types /repo/packages/shared-types

# Session storage writes under node_modules/.astro (fsLite default of the
# @astrojs/node adapter); the non-root user needs write access there.
USER node

WORKDIR /repo/apps/admin

EXPOSE 4321

CMD ["node", "./dist/server/entry.mjs"]
