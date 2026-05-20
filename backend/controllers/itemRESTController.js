var mongoose = require('mongoose');
var Occurrence = require('../models/occurrence');
var User = require('../models/user');
var Notification = require('../models/notification');
const emailService = require('../services/emailService');

var itemRESTController = {};

// Validate input
const validateOccurrenceInput = (data) => {
    const errors = [];
    if (!data.title || data.title.trim().length === 0) errors.push("Title is required");
    if (!data.description || data.description.trim().length === 0) errors.push("Description is required");
    if (!data.category || data.category.trim().length === 0) errors.push("Category is required");
    if (data.latitude !== undefined && (isNaN(data.latitude) || data.latitude < -90 || data.latitude > 90)) {
        errors.push("Latitude must be a number between -90 and 90");
    }
    if (data.longitude !== undefined && (isNaN(data.longitude) || data.longitude < -180 || data.longitude > 180)) {
        errors.push("Longitude must be a number between -180 and 180");
    }
    return errors;
};

// Create Occurrence with Notification
itemRESTController.createOccurrence = async function (req, res, next) {
    try {
        const { title, description, category, location, latitude, longitude, photoUrl } = req.body;
        const currentUserId = req.user ? (req.user.id || req.user._id) : null;

        // Validate user is authenticated
        if (!currentUserId) {
            return res.status(401).json({ message: "Token is missing or invalid." });
        }

        // Validate input
        const validationErrors = validateOccurrenceInput({ title, description, category, latitude, longitude });
        if (validationErrors.length > 0) {
            return res.status(400).json({ message: "Validation failed", errors: validationErrors });
        }

        const newOccurrence = new Occurrence({
            title: title.trim(),
            description: description.trim(),
            category: category.trim(),
            location: location?.trim() || '',
            latitude: latitude || null,
            longitude: longitude || null,
            photoUrl: photoUrl || '',
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
        console.error("Create occurrence error:", error);
        res.status(500).json({ message: "Error creating occurrence" });
    }
};

// Get My Occurrences
itemRESTController.getMyOccurrences = async function (req, res, next) {
    try {
        const userId = req.user ? (req.user.id || req.user._id) : null;
        if (!userId) {
            return res.status(401).json({ message: "User not authenticated." });
        }
        const occurrences = await Occurrence.find({ userId: userId }).sort({ createdAt: -1 });
        res.json(occurrences);
    } catch (error) {
        console.error("Get my occurrences error:", error);
        res.status(500).json({ message: "Error fetching occurrences" });
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
        console.error("Get map occurrences error:", error);
        res.status(500).json({ message: "Error fetching map data" });
    }
};

// Get single occurrence detail
itemRESTController.show = async function (req, res, next) {
    try {
        const occurrence = await Occurrence.findById(req.params.id);
        if (!occurrence) return res.status(404).json({ message: "Occurrence not found!" });
        res.json(occurrence);
    } catch (err) {
        console.error("Show occurrence error:", err);
        res.status(500).json({ message: "Error fetching occurrence" });
    }
};

// Update occurrence (only owner can update)
itemRESTController.updateOccurrence = async function(req, res) {
    try {
        const occurrenceId = req.params.id;
        const userId = req.user ? (req.user.id || req.user._id) : null;

        if (!userId) {
            return res.status(401).json({ message: "User not authenticated." });
        }

        const occurrence = await Occurrence.findById(occurrenceId);
        if (!occurrence) {
            return res.status(404).json({ message: "Occurrence not found." });
        }

        // Check if user is the owner
        if (String(occurrence.userId) !== String(userId)) {
            return res.status(403).json({ message: "Only the occurrence owner can update it." });
        }

        // Validate input
        const validationErrors = validateOccurrenceInput(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({ message: "Validation failed", errors: validationErrors });
        }

        // Update fields
        occurrence.title = req.body.title?.trim() || occurrence.title;
        occurrence.description = req.body.description?.trim() || occurrence.description;
        occurrence.category = req.body.category?.trim() || occurrence.category;
        occurrence.location = req.body.location?.trim() || occurrence.location;
        if (req.body.latitude !== undefined) occurrence.latitude = req.body.latitude;
        if (req.body.longitude !== undefined) occurrence.longitude = req.body.longitude;
        if (req.body.photoUrl !== undefined) occurrence.photoUrl = req.body.photoUrl;

        const updatedOccurrence = await occurrence.save();
        res.status(200).json(updatedOccurrence);
    } catch (error) {
        console.error("Update occurrence error:", error);
        res.status(500).json({ message: "Error updating occurrence" });
    }
};

// Update status (admin or moderator only)
itemRESTController.updateStatus = async function(req, res) {
    try {
        const { status } = req.body;
        const userId = req.user ? (req.user.id || req.user._id) : null;
        const userRole = req.user ? req.user.role : null;
        const validStatuses = ['PENDING', 'UNDER_ANALYSIS', 'APPROVED', 'IN_RESOLUTION', 'SOLVED', 'REJECTED'];

        // Validate user is authenticated
        if (!userId) {
            return res.status(401).json({ message: "User not authenticated." });
        }

        // Validate user has permission to change status
        if (userRole !== 'Admin' && userRole !== 'Moderator') {
            return res.status(403).json({ message: "Only admin or moderator can change occurrence status." });
        }

        // Validate status
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({ message: `Invalid status. Valid options: ${validStatuses.join(', ')}` });
        }

        // Find and update occurrence
        const updatedOccurrence = await Occurrence.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!updatedOccurrence) {
            return res.status(404).json({ message: "Occurrence not found." });
        }

        // Create notification
        const statusNotification = new Notification({
            userId: updatedOccurrence.userId,
            occurrenceId: updatedOccurrence._id,
            message: `The status of "${updatedOccurrence.title}" was updated to ${status}.`,
            type: "STATUS_UPDATE"
        });
        await statusNotification.save();

        // Send email notification to occurrence owner
        try {
            const occurrenceOwner = await User.findById(updatedOccurrence.userId);
            if (occurrenceOwner && occurrenceOwner.email) {
                await emailService.sendStatusUpdateEmail(
                    occurrenceOwner.email,
                    updatedOccurrence.title,
                    status
                );
            }
        } catch (emailError) {
            console.error("Failed to send status update email:", emailError);
            // Don't fail the request if email fails
        }

        res.status(200).json(updatedOccurrence);
    } catch (error) {
        console.error("Update status error:", error);
        res.status(500).json({ message: "Error updating status" });
    }
};

// Delete occurrence (only owner can delete)
itemRESTController.deleteOccurrence = async function(req, res) {
    try {
        const occurrenceId = req.params.id;
        const userId = req.user ? (req.user.id || req.user._id) : null;

        if (!userId) {
            return res.status(401).json({ message: "User not authenticated." });
        }

        const occurrence = await Occurrence.findById(occurrenceId);
        if (!occurrence) {
            return res.status(404).json({ message: "Occurrence not found." });
        }

        // Check if user is the owner
        if (String(occurrence.userId) !== String(userId)) {
            return res.status(403).json({ message: "Only the occurrence owner can delete it." });
        }

        await Occurrence.findByIdAndDelete(occurrenceId);
        res.status(200).json({ message: "Occurrence deleted successfully." });
    } catch (error) {
        console.error("Delete occurrence error:", error);
        res.status(500).json({ message: "Error deleting occurrence" });
    }
};

// Add comment
itemRESTController.addComment = async function(req, res) {
    try {
        const { text } = req.body;
        const occurrenceId = req.params.id;

        if (!text || text.trim().length === 0) {
            return res.status(400).json({ message: "Comment text is required." });
        }

        const occurrence = await Occurrence.findById(occurrenceId);
        if (!occurrence) {
            return res.status(404).json({ message: "Occurrence not found." });
        }

        const newComment = {
            authorId: req.user?.id || req.user?._id || "anonymous_user",
            authorName: req.user?.name || "Anonymous User",
            text: text.trim(),
            createdAt: new Date()
        };

        occurrence.comments.push(newComment);
        await occurrence.save();

        const ownerId = String(occurrence.userId || "");
        const currentUserId = String(req.user?.id || req.user?._id || "");

        // Only notify the owner if the commenter is a different person
        if (ownerId !== currentUserId && ownerId !== "") {
            // Create notification in database
            const notification = new Notification({
                userId: occurrence.userId,
                occurrenceId: occurrence._id,
                message: `New comment on your occurrence: "${occurrence.title}"`,
                type: "NEW_COMMENT" 
            });
            await notification.save();

            // Send email notification
            try {
                const occurrenceOwner = await User.findById(occurrence.userId);
                if (occurrenceOwner && occurrenceOwner.email) {
                    await emailService.sendCommentNotificationEmail(
                        occurrenceOwner.email,
                        occurrence.title,
                        newComment.authorName
                    );
                }
            } catch (emailError) {
                console.error("Failed to send comment notification email:", emailError);
                // Don't fail the request if email fails
            }
        }

        res.status(201).json(occurrence);
    } catch (error) {
        console.error("Add comment error:", error);
        res.status(500).json({ message: "Error adding comment" });
    }
};

// Delete Comment (only comment author can delete)
itemRESTController.deleteComment = async function(req, res) {
    try {
        const { id: occurrenceId, commentId } = req.params;
        const userId = req.user ? (req.user.id || req.user._id) : null;

        if (!userId) {
            return res.status(401).json({ message: "User not authenticated." });
        }

        const occurrence = await Occurrence.findById(occurrenceId);
        if (!occurrence) {
            return res.status(404).json({ message: "Occurrence not found." });
        }

        const comment = occurrence.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found." });
        }

        // Check if user is the comment author or occurrence owner
        if (String(comment.authorId) !== String(userId) && String(occurrence.userId) !== String(userId)) {
            return res.status(403).json({ message: "You cannot delete this comment." });
        }

        comment.deleteOne();
        await occurrence.save();

        res.status(200).json({ message: "Comment deleted successfully." });
    } catch (error) {
        console.error("Delete comment error:", error);
        res.status(500).json({ message: "Error deleting comment" });
    }
};

module.exports = itemRESTController;
