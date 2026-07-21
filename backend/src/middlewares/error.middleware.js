import { errorResponse } from '../utils/apiResponse.js';
import { env } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message || 'Server Error';

  // Log error in development
  if (env.NODE_ENV === 'development') {
    console.error('[GLOBAL ERROR HANDLER]:', err);
  }

  // Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of ${err.value}`;
    error = new Error(message);
    error.statusCode = 400;
  }

  // Mongoose Duplicate Key (MongoServerError code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `Duplicate field value entered for field: ${field}. Please use another value.`;
    error = new Error(message);
    error.statusCode = 400;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map((val) => val.message).join(', ');
    error = new Error(message);
    error.statusCode = 400;
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid authentication token. Please log in again.';
    error = new Error(message);
    error.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Session expired. Please log in again.';
    error = new Error(message);
    error.statusCode = 401;
  }

  const statusCode = error.statusCode || err.statusCode || 500;
  const errorMsg = error.message || 'Internal Server Error';

  return errorResponse(res, statusCode, errorMsg, env.NODE_ENV === 'development' ? err.stack : null);
};
