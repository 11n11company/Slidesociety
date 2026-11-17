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
  EMAIL_PASS: process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS || null,
  EMAIL_FROM: process.env.EMAIL_FROM || 'Slidescoiety Sim Racing Store <support@slidescoiety.com>',
  ADMIN_NOTIFICATION_EMAIL: process.env.ADMIN_NOTIFICATION_EMAIL || 'orders@slidescoiety.com',

  // Seller & Business Information (Controlled Settings)
  SELLER_NAME: process.env.SELLER_NAME || 'Slidescoiety Sim Racing Store',
  SELLER_TAGLINE: 'Professional Sim Racing Cockpits & Hardware',
  SELLER_EMAIL: process.env.SELLER_EMAIL || 'support@slidescoiety.com',
  SELLER_PHONE: process.env.SELLER_PHONE || '+91 98765 43210',
  SELLER_ADDRESS: process.env.SELLER_ADDRESS || null,
  SELLER_GSTIN: process.env.SELLER_GSTIN || null,

  // Private Invoice Storage Configuration
  INVOICE_STORAGE_DIR: process.env.INVOICE_STORAGE_DIR || path.resolve(__dirname, '../../storage/invoices'),

  // Razorpay Payment Gateway Configuration
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder_key',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_placeholder_secret',
  RAZORPAY_WEBHOOK_SECRET: process.env.RAZORPAY_WEBHOOK_SECRET || 'rzp_webhook_secret_placeholder'
};
