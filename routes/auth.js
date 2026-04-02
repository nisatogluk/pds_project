var express = require('express');
var router = express.Router();
var authController = require('../controllers/authController');
var verifyToken= require('../middleware/authMiddleware');
router.post('/register', authController.register);
router.get('/confirm/email', authController.confirmEmail);
router.post('/login', authController.login);
router.put('/change-password', verifyToken, authController.changePassword);

module.exports = router;