import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/user.model.js';
import { errorResponse } from '../utils/apiResponse.js';

export const protect = async (req, res, next) => {
  let token;

  // 1. Get token from cookies or Authorization header
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2. Check if token exists
  if (!token) {
    return errorResponse(res, 401, 'Not authorized to access this resource. Please log in.');
  }

  try {
    // 3. Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // 4. Get user from token
    const user = await User.findById(decoded.id);
    if (!user) {
      return errorResponse(res, 401, 'User associated with this token no longer exists.');
    }

    // 5. Check if user is verified
    if (!user.isVerified) {
      return errorResponse(res, 403, 'Your email address is not verified. Please verify your email first.');
    }

    // 6. Grant access
    req.user = user;
    next();
  } catch (error) {
    console.error('[AUTH MIDDLEWARE ERROR] JWT verification failed:', error.message);
    return errorResponse(res, 401, 'Invalid or expired token. Please log in again.');
  }
};
