import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';

const SALT_ROUNDS = 12;

/**
 * Hashes a plaintext password using bcrypt with 12 salt rounds
 */
export async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

/**
 * Compares a candidate password against stored bcrypt hash
 */
export async function comparePassword(candidatePassword, storedHash) {
  if (!candidatePassword || !storedHash) return false;
  return bcrypt.compare(candidatePassword, storedHash);
}

/**
 * Generates a signed JWT session token for customer authentication
 */
export function generateSessionToken(payload) {
  return jwt.sign(
    {
      id: payload.id,
      email: payload.email,
      role: payload.role || 'CUSTOMER'
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN || '7d',
      algorithm: 'HS256'
    }
  );
}

/**
 * Verifies and decodes a signed JWT session token
 */
export function verifySessionToken(token) {
  try {
    return jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch (err) {
    return null;
  }
}

/**
 * Generates a cryptographically secure random token (for email verification & password reset)
 */
export function generateRandomToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}

/**
 * Computes SHA-256 hash of a token for secure database storage
 */
export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
