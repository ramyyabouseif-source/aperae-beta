/**
 * Prisma Client Singleton
 * Ensures a single shared Prisma client instance across the application
 * with proper connection pooling for Neon PostgreSQL
 */

const { PrismaClient } = require('@prisma/client');

// Create singleton instance with connection pooling configuration
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
  // Connection pooling is handled by Neon's pooled connection string
  // Ensure DATABASE_URL includes ?pgbouncer=true&connection_limit=5
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

