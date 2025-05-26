FROM node:18-alpine

# Create non-root user first
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory and change ownership
WORKDIR /app
RUN chown nextjs:nodejs /app

# Switch to non-root user before installing
USER nextjs

# Copy frontend package files with correct ownership
COPY --chown=nextjs:nodejs apps/frontend/package.json ./
COPY --chown=nextjs:nodejs apps/frontend/pnpm-lock.yaml* ./

# Install dependencies (creates node_modules with correct ownership)
RUN pnpm install --no-frozen-lockfile

# Copy frontend source code with correct ownership
COPY --chown=nextjs:nodejs apps/frontend ./

# Expose port
EXPOSE 3000

# Start dev server
CMD ["pnpm", "dev"]