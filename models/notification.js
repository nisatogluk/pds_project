const mongoose = require('mongoose');

// Schema for system notifications
const notificationSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true 
    }, // User who receives the notification
    occurrenceId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Occurrence',
        required: true 
    }, // Related occurrence
    message: { 
        type: String, 
        required: true 
    }, // Notification text
    type: { 
        type: String, 
        enum: ['STATUS_UPDATE', 'NEW_COMMENT', 'NEW_OCCURRENCE'],
        required: true 
    }, // Action that triggered it
    isRead: { 
        type: Boolean, 
        default: false 
    }, // Check if user has seen it
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Notification', notificationSchema);