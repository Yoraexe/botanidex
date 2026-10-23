# ==============================================================================
# Flora SMK — Multi-Stage Non-Root Production Dockerfile
# Standards: Astesia DevOps Phase 5 / Zero-Root / Alpine Minimal
# ==============================================================================

# Stage 1: Base Alpine
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache curl

# Stage 2: Dependencies
FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Stage 3: Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY . .
ENV NODE_ENV=production
ENV ADAPTER=node
RUN npm run build
RUN npm prune --production

# Stage 4: Production Runner (Non-root user)
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Create non-root system user and group
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy build artifacts and dependencies
COPY --from=builder --chown=appuser:appgroup /app/package*.json ./
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/build ./build

# Switch to non-root user
USER appuser

EXPOSE 3000

# Health check against dedicated endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "build/index.js"]
