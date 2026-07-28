// Lightweight custom error so controllers can throw new ApiError(404, 'msg')
// and have it map cleanly onto an HTTP response in the error handler.
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
