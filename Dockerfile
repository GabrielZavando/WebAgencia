# ============================================================
# Stage 1: Builder — instala dependencias y compila el proyecto
# Las variables PUBLIC_* se inyectan en build-time via --build-arg
# porque Astro/Vite las embebe en el bundle estático del cliente.
# ============================================================
FROM node:22-alpine AS builder
WORKDIR /app

RUN npm install -g corepack@latest && corepack enable pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm config set strict-dep-builds false
RUN pnpm install --frozen-lockfile

# ARGs para las variables públicas de Astro (embebidas en el bundle)
ARG PUBLIC_API_URL
ARG PUBLIC_API_BASE_URL
ARG PUBLIC_FIREBASE_API_KEY
ARG PUBLIC_FIREBASE_AUTH_DOMAIN
ARG PUBLIC_FIREBASE_PROJECT_ID
ARG PUBLIC_FIREBASE_STORAGE_BUCKET
ARG PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ARG PUBLIC_FIREBASE_APP_ID
ARG PUBLIC_TURNSTILE_SITE_KEY
ARG PUBLIC_GTM_ID
# Exponerlas como ENV para que Vite las recoja durante el build
ENV PUBLIC_API_URL=$PUBLIC_API_URL
ENV PUBLIC_API_BASE_URL=$PUBLIC_API_BASE_URL
ENV PUBLIC_FIREBASE_API_KEY=$PUBLIC_FIREBASE_API_KEY
ENV PUBLIC_FIREBASE_AUTH_DOMAIN=$PUBLIC_FIREBASE_AUTH_DOMAIN
ENV PUBLIC_FIREBASE_PROJECT_ID=$PUBLIC_FIREBASE_PROJECT_ID
ENV PUBLIC_FIREBASE_STORAGE_BUCKET=$PUBLIC_FIREBASE_STORAGE_BUCKET
ENV PUBLIC_FIREBASE_MESSAGING_SENDER_ID=$PUBLIC_FIREBASE_MESSAGING_SENDER_ID
ENV PUBLIC_FIREBASE_APP_ID=$PUBLIC_FIREBASE_APP_ID
ENV PUBLIC_TURNSTILE_SITE_KEY=$PUBLIC_TURNSTILE_SITE_KEY
ENV PUBLIC_GTM_ID=$PUBLIC_GTM_ID
COPY . .
RUN pnpm run build && ls -la dist/

# ============================================================
# Stage 2: Production — imagen ligera solo con lo necesario
# ============================================================
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production

RUN npm install -g corepack@latest && corepack enable pnpm

# Solo dependencias de runtime
COPY package.json pnpm-lock.yaml ./
RUN pnpm config set strict-dep-builds false
RUN pnpm install --prod --frozen-lockfile

# Copiar el output del build de Astro SSR
COPY --from=builder /app/dist ./dist

# Usuario no-root por seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S astro -u 1001
USER astro

# Cloud Run inyecta PORT como variable de entorno
ENV PORT=8080
EXPOSE 8080

# Servidor standalone de Astro SSR
CMD ["node", "./dist/server/entry.mjs"]
