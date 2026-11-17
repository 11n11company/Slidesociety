#!/usr/bin/env node
/**
 * ============================================================================
 * Slidescoiety Sim Racing Store — Initial Admin Provisioning Utility
 * ============================================================================
 * Usage:
 *   node src/utils/createAdmin.js --email admin@slidescoiety.com --name "Lead Admin" --password "YourStrongPassword123"
 *
 * Or via environment variables:
 *   ADMIN_EMAIL=admin@slidescoiety.com ADMIN_NAME="Lead Admin" ADMIN_PASSWORD="..." node src/utils/createAdmin.js
 *
 * Security:
 * - Credentials are never hardcoded.
 * - Password is encrypted with bcrypt (12 rounds) before database storage.
 * - Role is explicitly set to ADMIN.
 * - Account is immediately marked as verified (isVerified: true).
 * ============================================================================
 */

import { prisma } from '../config/db.js';
import { hashPassword } from './security.js';
import { logger } from './logger.js';

function parseArgs() {
  const args = process.argv.slice(2);
  const params = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--email' && args[i + 1]) params.email = args[++i];
    if (args[i] === '--name' && args[i + 1]) params.name = args[++i];
    if (args[i] === '--password' && args[i + 1]) params.password = args[++i];
    if (args[i] === '--role' && args[i + 1]) params.role = args[++i];
  }
  return {
    email: params.email || process.env.ADMIN_EMAIL,
    name: params.name || process.env.ADMIN_NAME || 'Slidescoiety Administrator',
    password: params.password || process.env.ADMIN_PASSWORD,
    role: (params.role || 'ADMIN').toUpperCase()
  };
}

async function run() {
  const { email, name, password, role } = parseArgs();

  if (!email || !password) {
    console.error(`
[ERROR] Missing required arguments for admin provisioning.

Usage:
  node src/utils/createAdmin.js --email <admin-email> --name <full-name> --password <strong-password> [--role ADMIN|SUPPORT]
    `);
    process.exit(1);
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error('[ERROR] Invalid email address format.');
    process.exit(1);
  }

  // Validate password complexity
  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    console.error('[ERROR] Password must be at least 8 characters long and contain both letters and numbers.');
    process.exit(1);
  }

  const cleanEmail = email.trim().toLowerCase();
  console.log(`[PROVISION] Checking existing account for [${cleanEmail}] with role [${role}]...`);

  const passwordHash = await hashPassword(password);

  const existing = await prisma.user.findUnique({
    where: { email: cleanEmail }
  });

  if (existing) {
    const updated = await prisma.user.update({
      where: { id: existing.id },
      data: {
        role,
        fullName: name,
        passwordHash,
        isVerified: true
      },
      select: { id: true, email: true, fullName: true, role: true, isVerified: true }
    });
    console.log(`[SUCCESS] Existing user promoted to ${role}:`, updated);
  } else {
    const created = await prisma.user.create({
      data: {
        email: cleanEmail,
        fullName: name,
        passwordHash,
        role,
        isVerified: true
      },
      select: { id: true, email: true, fullName: true, role: true, isVerified: true }
    });
    console.log(`[SUCCESS] New ${role} account provisioned:`, created);
  }

  await prisma.$disconnect();
  console.log('[PROVISION] Completed successfully.');
}

run().catch((err) => {
  console.error('[ERROR] Provisioning failed:', err.message);
  process.exit(1);
});

