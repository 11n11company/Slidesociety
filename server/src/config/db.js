import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';
import { env } from './env.js';

let prisma;

try {
  prisma = new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
  });
} catch (error) {
  logger.error('Failed to instantiate Prisma Client:', error);
}

let isDbConnected = false;

export async function checkDatabaseConnection() {
  if (!prisma) return false;
  try {
    // Attempt a lightweight raw ping query
    await prisma.$queryRaw`SELECT 1`;
    isDbConnected = true;
    logger.info('Database connection established successfully via Prisma (PostgreSQL).');
    return true;
  } catch (error) {
    isDbConnected = false;
    logger.warn('PostgreSQL database is currently unreachable on ' + env.DATABASE_URL.split('@')[1] || 'localhost');
    logger.info('Running in high-resilience API mode (catalogue queries backed by fallback cache).');
    return false;
  }
}

export function getDatabaseStatus() {
  return isDbConnected;
}

export { prisma };
