FROM oven/bun:1.1-slim AS base

FROM base AS deps
RUN apt-get update && \
  apt-get upgrade -y && \
  apt-get install -y wget gnupg ca-certificates unzip curl openssl \
  --no-install-recommends
RUN apt-get clean && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json bun.lockb* yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f bun.lockb ]; then bun i --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i; \
  else echo "Lockfile not found." && exit 1; \
  fi
FROM base AS builder
ARG ENV_FILE
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
COPY $ENV_FILE .env
RUN \
  bunx next telemetry disable &&  \
  bun run generate && bun run build

FROM oven/bun:1.1-alpine AS runner
WORKDIR /app

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/public ./public
COPY ./docker-entrypoint.sh /docker-entrypoint.sh
ENV \
  NODE_ENV=production \
  HOSTNAME=0.0.0.0 \
  PORT=3000 \
  NEXT_SHARP_PATH=/app/node_modules/sharp
EXPOSE 3000
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD  ["bun", "server.js"]

