const Notification = require('../models/notification');

const notificationController = {};

notificationController.getMyNotifications = async function(req, res) {
    try {
        const notifications = await Notification.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = notificationController;