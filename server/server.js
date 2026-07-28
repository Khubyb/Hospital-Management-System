require('dotenv').config();
const express = require('express');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');

const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/authRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');

const app = express();

connectDB();

// --- Security middleware ---
app.use(helmet());
app.use(mongoSanitize()); // strips $ and . from req.body/query/params -> NoSQL injection protection
app.use(xss()); // sanitizes user input coming from POST/GET/PUT to prevent XSS

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true, // allow the httpOnly auth cookie to be sent
  })
);

// Global rate limiter (stricter limiters are also applied per-route on auth endpoints)
app.use(
  rateLimit({
    windowMs: (Number(process.env.RATE_LIMIT_WINDOW_MINUTES) || 15) * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// --- Core middleware ---
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// --- Health check ---
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is healthy', timestamp: new Date().toISOString() });
});

// --- API routes ---
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);

// TODO (next iteration): medicalRecordRoutes, prescriptionRoutes, paymentRoutes,
// notificationRoutes, adminRoutes, reviewRoutes, uploadRoutes

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Catch unhandled promise rejections (e.g. DB connection issues) without crashing silently
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
