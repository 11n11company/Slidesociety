import app from './app.js';
import { env, validateEnv } from './config/env.js';
import { checkDatabaseConnection, prisma } from './config/db.js';
import { logger } from './utils/logger.js';
import { expireStaleReservations } from './services/inventoryReservation.service.js';

async function startServer() {
  logger.info(`Starting Slidescoiety Backend in [${env.NODE_ENV}] mode...`);

  // Validate critical environment variables
  validateEnv();

  // Verify database connection status
  await checkDatabaseConnection();

  const server = app.listen(env.PORT, () => {
    logger.info(`========================================================`);
    logger.info(`Slidescoiety Backend API Server is running!`);
    logger.info(`URL: http://localhost:${env.PORT}`);
    logger.info(`Health Check: http://localhost:${env.PORT}/api/health`);
    logger.info(`Products API: http://localhost:${env.PORT}/api/v1/products`);
    logger.info(`Categories API: http://localhost:${env.PORT}/api/v1/categories`);
    logger.info(`Allowed CORS Origin: ${env.CORS_ORIGIN}`);
    logger.info(`========================================================`);
  });

  // Background Job: Expire Stale Stock Reservations
  const cleanupTimer = setInterval(async () => {
    try {
      const expiredCount = await expireStaleReservations();
      if (expiredCount > 0) {
        logger.info(`Automated cleanup: Released ${expiredCount} expired stock reservation(s).`);
      }
    } catch (err) {
      logger.error(`Automated reservation cleanup error: ${err.message}`);
    }
  }, env.RESERVATION_CLEANUP_INTERVAL_MS);
  cleanupTimer.unref();

  // Graceful shutdown handling
  const shutdown = async (signal) => {
    logger.info(`Received ${signal}. Gracefully shutting down Express server...`);
    server.close(async () => {
      logger.info('HTTP server closed.');
      if (prisma) {
        await prisma.$disconnect();
        logger.info('Prisma database client disconnected.');
      }
      process.exit(0);
    });

    // Force exit after 10s if graceful shutdown hangs
    setTimeout(() => {
      logger.error('Forced shutdown due to timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer().catch((error) => {
  logger.error('Critical failure during server startup:', error);
  process.exit(1);
});

