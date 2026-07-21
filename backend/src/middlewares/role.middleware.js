import { errorResponse } from '../utils/apiResponse.js';

/**
 * Restrict access to specific roles
 * @param {...string} roles - Allowed roles (e.g., 'doctor', 'patient')
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, 'Authentication required.');
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        `Role '${req.user.role}' is not authorized to perform this action.`
      );
    }

    next();
  };
};
