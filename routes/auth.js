var express = require('express');
var router = express.Router();
var authController = require('../controllers/authController');

router.post('/register', authController.register);
router.get('/confirm/email', authController.confirmEmail);
router.post('/login', authController.login);

module.exports = router;