import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5500',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5500',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/slidescoiety_db?schema=public',
  LOG_FORMAT: process.env.LOG_FORMAT || 'dev',

  // Authentication & Security
  JWT_SECRET: process.env.JWT_SECRET || 'dev_insecure_jwt_secret_must_change_in_production_slidescoiety_2026',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  COOKIE_SECRET: process.env.COOKIE_SECRET || 'dev_cookie_secret_slidescoiety_2026',

  // Transactional Email Service
  EMAIL_HOST: process.env.EMAIL_HOST || null,
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT, 10) || 587,
  EMAIL_SECURE: process.env.EMAIL_SECURE === 'true',
  EMAIL_USER: process.env.EMAIL_USER || null,
  EMAIL_PASS: process.env.EMAIL_PASS || null,
  EMAIL_FROM: process.env.EMAIL_FROM || 'Slidescoiety Sim Racing Store <support@slidescoiety.com>'
};
