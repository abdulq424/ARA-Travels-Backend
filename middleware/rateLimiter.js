const rateLimit = require('express-rate-limit');

// Rate limiter for email verification
exports.emailVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 requests per windowMs
  message: {
    status: 'fail',
    message: 'Too many verification attempts, please try again later'
  }
});

// Rate limiter for password reset
exports.passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 requests per windowMs
  message: {
    status: 'fail',
    message: 'Too many password reset attempts, please try again later'
  }
});

// Rate limiter for 2FA
exports.twoFactorLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    status: 'fail',
    message: 'Too many 2FA attempts, please try again later'
  }
}); 