var mongoose = require('mongoose');
var Occurrence = require('../models/occurrence');
var User = require('../models/user');
var Notification = require('../models/notification');

var itemRESTController = {};

// [US#20] Create Occurrence with Notification
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

// [US#22] Get My Occurrences
itemRESTController.getMyOccurrences = async function (req, res, next) {
    try {
        const userId = req.user ? (req.user.id || req.user._id) : null;
        const occurrences = await Occurrence.find({ userId: userId }).sort({ createdAt: -1 });
        res.json(occurrences);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// [US#23] Get Public Occurrences for Map
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
            message: `The status of "${updatedOccurrence.title}" was updated to ${status}.`
        });
        await statusNotification.save();
        res.status(200).json(updatedOccurrence);
    } catch (error) {
        res.status(500).json({ message: "Error updating status.", error: error.message });
    }
};

// Add comment
itemRESTController.addComment = async function (req, res) {
    try {
        const { text } = req.body;
        const occurrence = await Occurrence.findById(req.params.id);
        if (!occurrence) return res.status(404).json({ message: "Occurrence not found." });

        const newComment = {
            userId: req.user.id || req.user._id,
            text,
            createdAt: new Date()
        };

        occurrence.comments.push(newComment);
        await occurrence.save();

        if (occurrence.userId.toString() !== newComment.userId.toString()) {
            await new Notification({
                userId: occurrence.userId,
                occurrenceId: occurrence._id,
                message: `New comment on your occurrence: "${text.substring(0, 20)}..."`
            }).save();
        }
        res.status(201).json(occurrence);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete comment
itemRESTController.deleteComment = async function (req, res) {
    try {
        const { id, commentId } = req.params;
        const occurrence = await Occurrence.findById(id);
        if (!occurrence) return res.status(404).json({ message: "Occurrence not found." });

        occurrence.comments = occurrence.comments.filter(c => c._id.toString() !== commentId);
        await occurrence.save();
        res.status(200).json({ message: "Comment deleted successfully", occurrence });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = itemRESTController;