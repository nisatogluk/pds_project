const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.put('/profile', authMiddleware.verifyToken, userController.updateUserProfile);
router.put('/update-password', authMiddleware.verifyToken, userController.updatePassword);
router.post('/forgot-password', userController.forgotPassword);

module.exports = router;