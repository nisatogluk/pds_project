var express = require('express');
var router = express.Router();
var authController = require('../controllers/authController');
var { verifyToken } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/confirm-email', authController.confirmEmail);

// Note: Password change is handled by PUT /users/update-password
  
module.exports = router;