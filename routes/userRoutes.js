const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Protect all routes
router.use(authMiddleware.protect);

// Profile routes
router.get('/profile', userController.getProfile);
router.patch('/profile', userController.updateProfile);
router.patch('/password', userController.updatePassword);
router.patch('/toggle-2fa', userController.toggleTwoFactor);

module.exports = router; 