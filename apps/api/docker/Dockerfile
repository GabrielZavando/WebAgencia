# =============================================================================
# Dockerfile multistage para Líder Digital API
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Dependencias
# -----------------------------------------------------------------------------
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production && npm cache clean --force

# -----------------------------------------------------------------------------
# Stage 2: Builder
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci && npx prisma generate

COPY . .

RUN npm run build

# -----------------------------------------------------------------------------
# Stage 3: Production
# -----------------------------------------------------------------------------
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

RUN chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]