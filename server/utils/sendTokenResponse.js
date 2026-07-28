const jwt = require('jsonwebtoken');

// Signs a JWT for a user id and sends it both as an httpOnly cookie
// (used by the browser automatically) and in the JSON body (used by
// mobile clients or tools like Postman that can't rely on cookies).
const sendTokenResponse = (user, statusCode, res) => {
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });

  const cookieExpireDays = Number(process.env.JWT_COOKIE_EXPIRE) || 7;

  const cookieOptions = {
    expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
    httpOnly: true, // not accessible via client-side JS -> mitigates XSS token theft
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'lax',
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      token,
      user: user.toSafeObject ? user.toSafeObject() : user,
    });
};

module.exports = sendTokenResponse;
