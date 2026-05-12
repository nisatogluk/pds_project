const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { verifyToken: authMiddleware } = require('../middleware/authMiddleware');

router.get('/', authMiddleware.verifyToken, notificationsRESTController.getMyNotifications);

module.exports = router;