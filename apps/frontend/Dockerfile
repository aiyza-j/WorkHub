FROM node:18-alpine AS base

# Install pnpm globally
RUN npm install -g pnpm

# ---------- Dependencies Layer ----------
FROM base AS deps
WORKDIR /app

# Copy the whole monorepo so workspace layout is preserved
COPY . .

# Install all dependencies for all workspaces
RUN pnpm install --frozen-lockfile

# ---------- Build Layer ----------
FROM base AS builder
WORKDIR /app

# Copy everything again (if caching doesn't already preserve)
COPY . .

# Reuse deps from the previous stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/frontend/node_modules ./apps/frontend/node_modules
COPY --from=deps /app/packages ./packages

# Set env vars
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Write config if needed
WORKDIR /app/apps/frontend
RUN echo 'module.exports = { output: "standalone" }' > next.config.js

# Build the frontend
RUN pnpm --filter frontend... build

# ---------- Final Runtime Layer ----------
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

WORKDIR /app/apps/frontend

# Copy the standalone server
COPY --from=builder /app/apps/frontend/.next/standalone ./
COPY --from=builder /app/apps/frontend/.next/static ./.next/static
COPY --from=builder /app/apps/frontend/public ./public

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["pnpm", "dev"]
