/**
 * Session Cleanup Service
 * 
 * Periodically cleans up expired and revoked sessions from the database
 * Should be run as a background job (e.g., daily or hourly)
 */

const prisma = require('../prisma/client');
const logger = require('../logger');

/**
 * Clean up expired sessions
 * Deletes sessions that are expired or have been revoked for more than 30 days
 * @returns {Promise<object>} Cleanup result
 */
async function cleanupExpiredSessions() {
  const startTime = Date.now();
  
  try {
    // Check if DATABASE_URL is configured
    if (!process.env.DATABASE_URL) {
      logger.warn('Session cleanup skipped: DATABASE_URL not configured');
      return {
        success: false,
        error: 'DATABASE_URL not configured',
        deletedCount: 0,
        durationMs: Date.now() - startTime
      };
    }

    // Test database connection first
    await prisma.$connect().catch(err => {
      throw new Error(`Database connection failed: ${err.message}`);
    });

    // Calculate cutoff date (30 days ago for revoked sessions)
    const revokedCutoff = new Date();
    revokedCutoff.setDate(revokedCutoff.getDate() - 30);

    // Delete expired sessions and old revoked sessions
    const result = await prisma.session.deleteMany({
      where: {
        OR: [
          // Expired sessions
          { expiresAt: { lt: new Date() } },
          // Revoked sessions older than 30 days
          {
            revokedAt: { not: null },
            revokedAt: { lt: revokedCutoff }
          }
        ]
      }
    });

    const duration = Date.now() - startTime;

    logger.info('Session cleanup completed', {
      deletedCount: result.count,
      durationMs: duration
    });

    return {
      success: true,
      deletedCount: result.count,
      durationMs: duration
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    
    // Don't log full stack trace for connection errors - just the message
    const isConnectionError = error.message && (
      error.message.includes('Can\'t reach database server') ||
      error.message.includes('connection') ||
      error.message.includes('DATABASE_URL')
    );

    if (isConnectionError) {
      logger.warn('Session cleanup skipped: Database connection issue', {
        error: error.message,
        durationMs: duration,
        hint: 'Check DATABASE_URL environment variable and database connectivity'
      });
    } else {
      logger.error('Session cleanup failed', {
        error: error.message,
        stack: error.stack,
        durationMs: duration
      });
    }

    return {
      success: false,
      error: error.message,
      deletedCount: 0,
      durationMs: duration
    };
  }
}

/**
 * Start periodic session cleanup
 * Runs cleanup every 24 hours
 * @param {number} intervalHours - Hours between cleanup runs (default: 24)
 */
function startPeriodicCleanup(intervalHours = 24) {
  const intervalMs = intervalHours * 60 * 60 * 1000;

  logger.info('Starting periodic session cleanup', {
    intervalHours,
    intervalMs
  });

  // Run immediately on start (non-blocking, won't crash if DB unavailable)
  cleanupExpiredSessions().catch(err => {
    // Only log as warning - connection issues are expected during initial startup
    logger.warn('Initial session cleanup skipped (will retry on next interval)', { 
      error: err.message,
      hint: 'This is normal if database connection is still being established'
    });
  });

  // Then run periodically
  const interval = setInterval(() => {
    cleanupExpiredSessions().catch(err => {
      logger.error('Periodic session cleanup failed', { error: err.message });
    });
  }, intervalMs);

  // Return cleanup function
  return () => {
    clearInterval(interval);
    logger.info('Periodic session cleanup stopped');
  };
}

module.exports = {
  cleanupExpiredSessions,
  startPeriodicCleanup
};



