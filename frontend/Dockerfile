# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock* package-lock.json* ./
RUN \
    if [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    else npm install; \
    fi

# Stage 2: Build the Next.js application
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1 # Disable Next.js telemetry in Docker builds

# Build the Next.js app (outputs to .next/standalone for standalone server)
RUN npm run build

# Stage 3: Run the Next.js application (production ready)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Copy static assets and standalone build output
COPY --from=builder /app/public ./public
# .next/standalone contains the Next.js server and built app
COPY --from=builder /app/.next/standalone ./
# .next/static contains optimized static assets
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000

# Command to run the standalone Next.js server
CMD ["node", "server.js"]