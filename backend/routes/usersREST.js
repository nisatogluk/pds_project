const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

// Update profile
router.put('/profile', verifyToken, userController.updateUserProfile);

// Change password (authenticated)
router.put('/update-password', verifyToken, userController.updatePassword);

// Forgot password (public)
router.post('/forgot-password', userController.forgotPassword);

// Reset password (public)
router.post('/reset-password', userController.resetPassword);

// Get profile
router.get('/profile', verifyToken, userController.getUserProfile);

module.exports = router;