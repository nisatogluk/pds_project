const express = require('express');
const router = express.Router();
const notificationsRESTController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware.verifyToken, notificationsRESTController.getMyNotifications);

module.exports = router;