import { logger } from '../utils/logger.js';
import { ApiResponse } from '../utils/apiResponse.js';

export function errorHandler(err, req, res, next) {
  logger.error(`${req.method} ${req.url} - Error caught by global handler:`, err.stack || err.message);

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : (process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message);

  return ApiResponse.error(res, message, statusCode, process.env.NODE_ENV === 'development' ? { stack: err.stack } : null);
}
