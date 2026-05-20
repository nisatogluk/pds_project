var express = require('express');
var router = express.Router();
var authController = require('../controllers/authController');

var authMiddleware = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.get('/confirm/email', authController.confirmEmail);
router.post('/login', authController.login);

router.put('/change-password', authMiddleware.verifyToken, authController.changePassword);

router.post('/login' ,authController.login );
router.post('/register', authController.register );
  
module.exports = router;