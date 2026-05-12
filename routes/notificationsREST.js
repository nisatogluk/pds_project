const express = require('express');
const router = express.Router();
const notificationsRESTController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware.verifyToken, notificationsRESTController.getMyNotifications);

// 2. Comentado temporariamente até criares esta função no controlador
// router.put('/:id/read', authMiddleware.verifyToken, notificationsRESTController.markAsRead);

module.exports = router;