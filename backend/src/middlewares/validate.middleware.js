import { validationResult } from 'express-validator';
import { errorResponse } from '../utils/apiResponse.js';

/**
 * Middleware to check validation results from express-validator
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param, // handles older express-validator versions or standard structures
      message: err.msg
    }));

    return errorResponse(res, 400, 'Input validation failed. Please check your fields.', formattedErrors);
  }
  next();
};
