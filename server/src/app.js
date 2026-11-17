import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import apiRoutes from './routes/index.js';
import { notFoundHandler } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// 1. Security Headers via Helmet
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows flexible integration during local dev
    crossOriginEmbedderPolicy: false
  })
);

// 2. CORS Configuration (Restricted to configured frontend origin)
const allowedOrigins = [
  env.CORS_ORIGIN,
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:5173'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked request from origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// 3. HTTP Request Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.LOG_FORMAT));
}

// 4. Body & Cookie Parsers
app.use(cookieParser(env.COOKIE_SECRET));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Mount API Routes
app.use('/api', apiRoutes);

// Root greeting / meta
app.get('/', (req, res) => {
  res.json({
    name: 'Slidescoiety Sim Racing Store Backend API',
    version: '1.0.0',
    documentation: '/api/health',
    endpoints: {
      health: '/api/health',
      products: '/api/v1/products',
      categories: '/api/v1/categories'
    }
  });
});

// 6. Handle 404 for undefined routes
app.use(notFoundHandler);

// 7. Centralized Global Error Handler
app.use(errorHandler);

export default app;

