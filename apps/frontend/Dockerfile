FROM node:18-alpine

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app
RUN chown nextjs:nodejs /app

USER nextjs

COPY --chown=nextjs:nodejs apps/frontend/package.json ./
COPY --chown=nextjs:nodejs apps/frontend/pnpm-lock.yaml* ./

RUN pnpm install --no-frozen-lockfile

COPY --chown=nextjs:nodejs apps/frontend ./

EXPOSE 3000

CMD ["pnpm", "dev"]