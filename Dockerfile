# ==============================================================================
# Multi-Stage Dockerfile for EduPulse Student Feedback Web Application
# Optimized for Security, Small Footprint, and High Performance
# ==============================================================================

# --- Stage 1: Build & Dependencies ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies (ci for deterministic builds)
RUN npm ci --only=production

# --- Stage 2: Final Production Runtime ---
FROM node:20-alpine AS runner

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Create non-root user for security compliance
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy dependencies and application source code
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
COPY src/ ./src/
COPY public/ ./public/

# Set file ownership
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose HTTP Port
EXPOSE 3000

# Health check probe for Docker / Kubernetes
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Container entry point
CMD ["npm", "start"]
