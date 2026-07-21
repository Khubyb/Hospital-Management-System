import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

// Handle Uncaught Exceptions (synchronous errors)
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION ERROR] Shutting down due to uncaught exception...');
  console.error(err.name, err.message, err.stack);
  process.exit(1);
});

// Connect to Database
connectDB();

const PORT = env.PORT;

const server = app.listen(PORT, () => {
  console.log(`[SERVER] Hospital Management System running in ${env.NODE_ENV} mode on port ${PORT}`);
});

// Handle Unhandled Promise Rejections (asynchronous errors)
process.on('unhandledRejection', (err) => {
  console.error('[UNHANDLED REJECTION ERROR] Shutting down due to unhandled promise rejection...');
  console.error(err.name, err.message, err.stack);
  server.close(() => {
    process.exit(1);
  });
});
