# Multi-stage build for NestJS Reference Microservice

# Stage 1: Build
FROM node:24.11.1-alpine AS builder

WORKDIR /app

# Install build dependencies for native modules and tooling
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm install --no-audit --no-fund --legacy-peer-deps

# Copy source code and config
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production Runtime
FROM node:24.11.1-alpine AS production

# Security: create non-root user and group
RUN addgroup -g 1001 -S nodejs && \
    adduser -S backend -u 1001 && \
    mkdir -p /app && \
    chown -R backend:nodejs /app

WORKDIR /app
USER backend

# Copy package files
COPY --chown=backend:nodejs package*.json ./

# Copy installed node_modules from builder
COPY --from=builder --chown=backend:nodejs /app/node_modules ./node_modules

# Copy compiled application code from builder
COPY --from=builder --chown=backend:nodejs /app/dist ./dist

# Create logs directory for runtime logs / diagnostics
USER root
RUN mkdir -p /app/logs && chown -R backend:nodejs /app/logs && chmod 755 /app/logs
USER backend

WORKDIR /app

# EXPOSE HTTP (5024) and TCP RPC (5025)
EXPOSE 5024 5025

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:5024/api/health || wget -qO- http://localhost:5024/health || exit 1

# Run production build
CMD ["npm", "run", "start:prod"]
