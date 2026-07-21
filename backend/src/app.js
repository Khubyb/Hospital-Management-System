import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes.js';
import patientRoutes from './routes/patient.routes.js';
import doctorRoutes from './routes/doctor.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { env } from './config/env.js';
import { errorResponse } from './utils/apiResponse.js';

const app = express();

// 1. Security Headers (Helmet)
app.use(helmet());

// 2. CORS setup
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// 3. Rate Limiter (to protect from brute force / spam)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false
});
// Apply limiter to auth endpoints only to not block static loads or standard traffic too harshly
app.use('/api/v1/auth', limiter);

// 4. Request Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 5. Mount API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/patient', patientRoutes);
app.use('/api/v1/doctor', doctorRoutes);

// 6. Handle Undefined Routes (404)
app.use('*', (req, res) => {
  return errorResponse(res, 404, `Cannot find route ${req.originalUrl} on this server.`);
});

// 7. Global Error Handler Middleware
app.use(errorHandler);

export default app;
