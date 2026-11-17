import fs from 'fs';
import path from 'path';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

// Ensure storage directory exists
const storageDir = path.resolve(env.INVOICE_STORAGE_DIR);
if (!fs.existsSync(storageDir)) {
  fs.mkdirSync(storageDir, { recursive: true });
  logger.info(`Initialized private invoice storage directory at: ${storageDir}`);
}

/**
 * Validates and sanitizes a filename or storage key to strictly prevent directory traversal.
 */
function sanitizeFilename(key) {
  if (!key || typeof key !== 'string') {
    throw new Error('Invalid storage key or filename');
  }
  // Strip directories, retain only safe basename
  const base = path.basename(key).trim();
  // Safe filename regex: alphanumeric, underscores, hyphens, single dot for extension
  if (!/^[a-zA-Z0-9_\-]+\.pdf$/i.test(base)) {
    throw new Error('Invalid or unsafe invoice PDF filename');
  }
  return base;
}

/**
 * Resolves safe absolute path within the configured private storage directory.
 */
function resolveSafePath(filename) {
  const safeName = sanitizeFilename(filename);
  const targetPath = path.resolve(storageDir, safeName);

  // Path traversal assertion: targetPath must strictly reside within storageDir
  if (!targetPath.startsWith(storageDir)) {
    throw new Error('Access denied: Path traversal attempt detected');
  }

  return targetPath;
}

/**
 * Stores an invoice PDF buffer into private local storage.
 * @param {string} filename - e.g. "INV-20261118-1001.pdf"
 * @param {Buffer} buffer - Raw PDF data
 * @returns {Promise<{ storageKey: string, filePath: string }>}
 */
export async function saveInvoicePDF(filename, buffer) {
  const targetPath = resolveSafePath(filename);
  const safeName = path.basename(targetPath);

  await fs.promises.writeFile(targetPath, buffer);
  logger.info(`Stored invoice PDF [${safeName}] safely in private storage.`);

  return {
    storageKey: `invoices/${safeName}`,
    filePath: targetPath
  };
}

/**
 * Checks if an invoice PDF exists in storage.
 * @param {string} filenameOrKey
 * @returns {boolean}
 */
export function invoicePDFExists(filenameOrKey) {
  try {
    const targetPath = resolveSafePath(filenameOrKey);
    return fs.existsSync(targetPath);
  } catch {
    return false;
  }
}

/**
 * Retrieves a readable stream for an invoice PDF.
 * @param {string} filenameOrKey
 * @returns {fs.ReadStream}
 */
export function getInvoicePDFStream(filenameOrKey) {
  const targetPath = resolveSafePath(filenameOrKey);
  if (!fs.existsSync(targetPath)) {
    const err = new Error('Invoice PDF file not found in storage');
    err.statusCode = 404;
    err.code = 'INVOICE_FILE_NOT_FOUND';
    throw err;
  }
  return fs.createReadStream(targetPath);
}

/**
 * Retrieves the full buffer of an invoice PDF.
 * @param {string} filenameOrKey
 * @returns {Promise<Buffer>}
 */
export async function getInvoicePDFBuffer(filenameOrKey) {
  const targetPath = resolveSafePath(filenameOrKey);
  if (!fs.existsSync(targetPath)) {
    const err = new Error('Invoice PDF file not found in storage');
    err.statusCode = 404;
    err.code = 'INVOICE_FILE_NOT_FOUND';
    throw err;
  }
  return await fs.promises.readFile(targetPath);
}

export const storageService = {
  saveInvoicePDF,
  invoicePDFExists,
  getInvoicePDFStream,
  getInvoicePDFBuffer
};
