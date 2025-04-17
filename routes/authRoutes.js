const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { emailVerificationLimiter, passwordResetLimiter, twoFactorLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Public routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/verify-email/:token', emailVerificationLimiter, authController.verifyEmail);
router.post('/resend-verification', emailVerificationLimiter, authController.resendVerificationEmail);
router.post('/verify-2fa', twoFactorLimiter, authController.verifyTwoFactor);
router.post('/forgot-password', passwordResetLimiter, authController.forgotPassword);
router.patch('/reset-password/:token', passwordResetLimiter, authController.resetPassword);

// Protected routes
router.use(protect);
router.get('/user', authController.getUser);
router.post('/setup-2fa', authController.setupTwoFactor);
router.post('/verify-2fa-setup', authController.verifyTwoFactorSetup);
router.post('/disable-2fa', authController.disableTwoFactor);

module.exports = router; 