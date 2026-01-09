/**
 * Prisma Client Singleton
 * Ensures a single shared Prisma client instance across the application
 * with proper connection pooling for Neon PostgreSQL
 * 
 * CRITICAL-3: Added connection error recovery and health checks
 */

const { PrismaClient } = require('@prisma/client');
const logger = require('../logger');

// Create singleton instance with connection pooling configuration
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
  // Connection pooling is handled by Neon's pooled connection string
  // Ensure DATABASE_URL includes ?pgbouncer=true&connection_limit=5
});

// CRITICAL-3: Validate database connection on startup
// Fail fast if database is unreachable
async function validateConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info('Database connection validated successfully');
  } catch (error) {
    logger.error('Database connection failed on startup', { 
      error: error.message,
      code: error.code,
      meta: error.meta
    });
    // Fail fast - exit if database is unreachable
    process.exit(1);
  }
}

// Validate connection immediately
validateConnection().catch((error) => {
  logger.error('Database validation error', { error: error.message });
  process.exit(1);
});

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

// Handle process termination
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = prisma;

