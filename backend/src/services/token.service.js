import crypto from 'crypto';

/**
 * Generate a random verification token and its expiry date
 * @param {number} expiryInMinutes - Default 15 minutes
 * @returns {object} { token, expiry }
 */
export const generateVerificationToken = (expiryInMinutes = 15) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + expiryInMinutes * 60 * 1000);
  return { token, expiry };
};

/**
 * Generate a random password reset token and its expiry date
 * @param {number} expiryInMinutes - Default 15 minutes
 * @returns {object} { token, expiry }
 */
export const generateResetPasswordToken = (expiryInMinutes = 15) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiry = new Date(Date.now() + expiryInMinutes * 60 * 1000);
  return { token, expiry };
};
