const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken: authMiddleware } = require('../middleware/authMiddleware');

//router.get('/', authMiddleware.verifyToken, notificationController.getMyNotifications);

module.exports = router;