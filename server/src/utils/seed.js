import { prisma, checkDatabaseConnection } from '../config/db.js';
import { FALLBACK_PRODUCTS } from '../services/product.service.js';
import { logger } from './logger.js';

async function seed() {
  logger.info('Starting PostgreSQL database seed...');
  const connected = await checkDatabaseConnection();
  if (!connected) {
    logger.error('Cannot seed: PostgreSQL database is not reachable.');
    process.exit(1);
  }

  try {
    for (const p of FALLBACK_PRODUCTS) {
      await prisma.product.upsert({
        where: { id: p.id },
        update: {
          name: p.name,
          category: p.category,
          priceInr: p.priceInr,
          priceEurDisplay: p.priceEurDisplay,
          specDescription: p.specDescription,
          compatibilityNotes: p.compatibilityNotes,
          rating: p.rating,
          isAvailable: p.isAvailable,
          stockQuantity: p.stockQuantity,
          imageUrl: p.imageUrl
        },
        create: {
          id: p.id,
          name: p.name,
          category: p.category,
          priceInr: p.priceInr,
          priceEurDisplay: p.priceEurDisplay,
          specDescription: p.specDescription,
          compatibilityNotes: p.compatibilityNotes,
          rating: p.rating,
          isAvailable: p.isAvailable,
          stockQuantity: p.stockQuantity,
          imageUrl: p.imageUrl
        }
      });
      logger.info(`Upserted product: [${p.id}] ${p.name}`);
    }
    logger.info(`Successfully seeded ${FALLBACK_PRODUCTS.length} products into PostgreSQL.`);
  } catch (err) {
    logger.error('Error during database seed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seed();
}

