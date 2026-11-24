# syntax=docker/dockerfile:1
# =============================================================================
# apps/web — Astro SSG public site (output: 'static', no server adapter)
# Build context MUST be the monorepo root:
#   docker build -f apps/web/Dockerfile .
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Builder — pnpm workspace build of @webastro/web
# -----------------------------------------------------------------------------
FROM node:26-alpine AS builder

WORKDIR /repo

# pnpm pinned to the version declared in root package.json "packageManager"
# (corepack was removed from the Node 26 distribution)
RUN npm install --global pnpm@10.28.2

# PUBLIC_* are baked into the SSG at build time (Astro inlines them)
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

# Install only the dependency subtree needed by web (frozen lockfile)
RUN pnpm install --frozen-lockfile --filter @webastro/web...

# Copy sources and build shared-types first, then the SSG site
COPY packages/shared-types packages/shared-types
COPY apps/web apps/web

RUN pnpm --filter @webastro/shared-types build \
    && pnpm --filter @webastro/web build

# -----------------------------------------------------------------------------
# Stage 2: Runner — Nginx serving the static artifact (no Node runtime)
# -----------------------------------------------------------------------------
FROM nginx:alpine AS runner

COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /repo/apps/web/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
