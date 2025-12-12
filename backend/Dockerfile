# Use Node.js 18 Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies including OpenSSL and glibc compatibility for Prisma
RUN apk add --no-cache \
    curl \
    dumb-init \
    openssl \
    gcompat

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy package files
COPY package*.json ./

# Copy Prisma schema (needed for postinstall script)
COPY prisma ./prisma

# Install dependencies (this will run postinstall -> prisma generate)
RUN npm ci --only=production && npm cache clean --force

# Create OpenSSL 1.1 compatibility symlinks for Prisma 5.22.0
# Alpine 3.21 uses OpenSSL 3.0, but Prisma 5.22.0 expects 1.1 libraries
RUN ln -sf /usr/lib/libssl.so.3 /usr/lib/libssl.so.1.1 && \
    ln -sf /usr/lib/libcrypto.so.3 /usr/lib/libcrypto.so.1.1

# Copy application code
COPY . .

# Create logs directory
RUN mkdir -p logs && chown -R nodejs:nodejs logs

# Change ownership of the app directory
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "server.js"]




