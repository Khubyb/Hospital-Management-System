// Central error handler. Every controller forwards errors here via next(err)
// so the API always returns a consistent JSON error shape.
const errorHandler = (err, req, res, next) => {
  let error = { ...err, message: err.message };
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error.message = 'Resource not found';
    error.statusCode = 404;
  }

  // Mongoose duplicate key (e.g. duplicate email or license number)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    error.message = `An account with this ${field || 'value'} already exists`;
    error.statusCode = 409;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    error.message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    error.statusCode = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token, please log in again';
    error.statusCode = 401;
  }
  if (err.name === 'TokenExpiredError') {
    error.message = 'Session expired, please log in again';
    error.statusCode = 401;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

// Wraps a 404 for unmatched routes
const notFound = (req, res, next) => {
  res.status(404);
  next(new Error(`Route not found - ${req.originalUrl}`));
};

module.exports = { errorHandler, notFound };
