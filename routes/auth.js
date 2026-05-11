var express = require('express');
var router = express.Router();

const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const verifyToken = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.get('/confirm/email', authController.confirmEmail);
router.post('/login', authController.login);
router.put('/profile', authMiddleware, userController.updateUserProfile);
router.put('/change-password', verifyToken, authController.changePassword);

module.exports = router;