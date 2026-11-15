import { getDatabaseStatus } from '../config/db.js';
import { ApiResponse } from '../utils/apiResponse.js';

export function getHealth(req, res) {
  const dbStatus = getDatabaseStatus();

  return ApiResponse.success(res, {
    status: 'UP',
    service: 'slidescoiety-backend',
    version: '1.0.0',
    uptime: Math.floor(process.uptime()),
    database: {
      type: 'PostgreSQL',
      connected: dbStatus,
      status: dbStatus ? 'HEALTHY' : 'OFFLINE_FALLBACK'
    },
    environment: process.env.NODE_ENV || 'development'
  }, 'Slidescoiety Backend Service is healthy and operational');
}
