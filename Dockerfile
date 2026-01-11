# Use the official Node.js runtime as the base image
FROM node:20-alpine AS base
# Provide required native libs for Prisma on Alpine
# - libc6-compat: glibc compatibility layer
# - openssl: provides SSL libraries
# - ca-certificates: for SSL certificate verification
RUN apk add --no-cache libc6-compat openssl ca-certificates

# Install dependencies only when needed
FROM base AS deps
# Dependencies stage uses base which already has required native libs
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
# Use npm install to handle potential lockfile sync issues
RUN npm install

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for Prisma
ENV PRISMA_CLI_BINARY_TARGETS=linux-musl-openssl-3.0.x

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Set Prisma environment variables for runtime
ENV PRISMA_QUERY_ENGINE_LIBRARY=/app/.next/standalone/node_modules/.prisma/client/libquery_engine-linux-musl-openssl-3.0.x.so.node

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone output (includes minimal node_modules)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
