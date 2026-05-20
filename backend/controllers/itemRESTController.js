var mongoose = require('mongoose');
var Occurrence = require('../models/occurrence');
var User = require('../models/user');
var Notification = require('../models/notification');

var itemRESTController = {};

// Create Occurrence with Notification
itemRESTController.createOccurrence = async function (req, res, next) {
    try {
        const { title, description, category, location, latitude, longitude, photoUrl } = req.body;
        const currentUserId = req.user ? (req.user.id || req.user._id) : null;

        if (!currentUserId) {
            return res.status(401).json({ message: "Token is missing or invalid." });
        }

        const newOccurrence = new Occurrence({
            title, description, category, location, latitude, longitude, photoUrl,
            status: "PENDING",
            userId: currentUserId
        });

        const savedOccurrence = await newOccurrence.save();

        const newNotification = new Notification({
            userId: currentUserId,
            occurrenceId: savedOccurrence._id,
            message: `Your occurrence "${title}" was successfully created.`,
            type: "NEW_OCCURRENCE"
        });
        await newNotification.save();

        res.status(201).json(savedOccurrence);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get My Occurrences
itemRESTController.getMyOccurrences = async function (req, res, next) {
    try {
        const userId = req.user ? (req.user.id || req.user._id) : null;
        const occurrences = await Occurrence.find({ userId: userId }).sort({ createdAt: -1 });
        res.json(occurrences);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Public Occurrences for Map
itemRESTController.getPublicMapOccurrences = async function (req, res, next) {
    try {
        const visibleStatuses = ['APPROVED', 'IN_RESOLUTION', 'SOLVED'];
        const occurrences = await Occurrence.find({
            status: { $in: visibleStatuses },
            latitude: { $exists: true, $ne: null },
            longitude: { $exists: true, $ne: null }
        }).select('title status photoUrl latitude longitude _id');
        res.json(occurrences);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get single occurrence detail
itemRESTController.show = async function (req, res, next) {
    try {
        const occurrence = await Occurrence.findById(req.params.id);
        if (!occurrence) return res.status(404).json({ message: "Occurrence not found!" });
        res.json(occurrence);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update status and notify owner
itemRESTController.updateStatus = async function(req, res) {
    try {
        const { status } = req.body;
        const updatedOccurrence = await Occurrence.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!updatedOccurrence) return res.status(404).json({ message: "Occurrence not found." });

        const statusNotification = new Notification({
            userId: updatedOccurrence.userId,
            occurrenceId: updatedOccurrence._id,
            message: `The status of "${updatedOccurrence.title}" was updated to ${status}.`,
            type: "STATUS_UPDATE"
        });
        await statusNotification.save();
        res.status(200).json(updatedOccurrence);
    } catch (error) {
        res.status(500).json({ message: "Error updating status.", error: error.message });
    }
};

// Add comment
itemRESTController.addComment = async function(req, res) {
    try {
        const { text } = req.body;
        const occurrenceId = req.params.id;

        const occurrence = await Occurrence.findById(occurrenceId);
        if (!occurrence) {
            return res.status(404).json({ message: "Occurrence not found." });
        }

        const newComment = {
            authorId: req.user?.id || req.user?._id || "anonymous_user",
            authorName: req.user?.name || "Anonymous User",
            text: text,
            createdAt: new Date()
        };

        occurrence.comments.push(newComment);
        await occurrence.save();

        const ownerId = String(occurrence.userId || "");
        const currentUserId = String(req.user?.id || req.user?._id || "");

        // Only notify the owner if the commenter is a different person
        if (ownerId !== currentUserId && ownerId !== "") {
            const notification = new Notification({
                userId: occurrence.userId,
                occurrenceId: occurrence._id,
                message: `New comment on your occurrence: "${occurrence.title}"`,
                type: "NEW_COMMENT" 
            });
            await notification.save();
        }

        res.status(201).json(occurrence);
    } catch (error) {
        console.error("[DEBUG] Comment Error:", error);
        res.status(500).json({ error: error.message });
    }
};

// Delete Comment 
itemRESTController.deleteComment = async function(req, res) {
    try {
        // This is a placeholder to prevent the "Undefined" error in routes
        res.status(501).json({ message: "Delete comment functionality not implemented yet." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = itemRESTController;
