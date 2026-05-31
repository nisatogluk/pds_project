const Occurrence = require('../models/occurrence');
const User = require('../models/user');
const Notification = require('../models/notification');
const ModerationLog = require('../models/ModerationLog');
const emailService = require('../services/emailService');

const moderationController = {};

// Delete occurrence (moderator)
moderationController.deleteOccurrence = async function(req, res) {
    try {
        const { reason } = req.body;
        const moderatorId = req.user.id || req.user._id;
        const occurrenceId = req.params.id;

        if (!reason) return res.status(400).json({ message: "Reason is required." });

        const occurrence = await Occurrence.findById(occurrenceId);
        if (!occurrence) return res.status(404).json({ message: "Occurrence not found." });

        // Create moderation log
        await ModerationLog.create({
            moderatorId,
            targetType: 'occurrence',
            targetId: occurrenceId,
            reason
        });

        // Notify owner
        await Notification.create({
            userId: occurrence.userId,
            occurrenceId: occurrence._id,
            message: `Your occurrence "${occurrence.title}" was removed by a moderator. Reason: ${reason}`,
            type: "STATUS_UPDATE"
        });

        // Send email
        try {
            const owner = await User.findById(occurrence.userId);
            if (owner?.email) {
                await emailService.sendStatusUpdateEmail(owner.email, occurrence.title, `Removed - Reason: ${reason}`);
            }
        } catch (e) {
            console.error("Email error:", e);
        }

        await Occurrence.findByIdAndDelete(occurrenceId);
        res.status(200).json({ message: "Occurrence deleted by moderator." });

    } catch (error) {
        console.error("Moderation delete error:", error);
        res.status(500).json({ message: "Error deleting occurrence." });
    }
};

// Delete comment (moderator)
moderationController.deleteComment = async function(req, res) {
    try {
        const { reason } = req.body;
        const moderatorId = req.user.id || req.user._id;
        const { id: occurrenceId, commentId } = req.params;

        if (!reason) return res.status(400).json({ message: "Reason is required." });

        const occurrence = await Occurrence.findById(occurrenceId);
        if (!occurrence) return res.status(404).json({ message: "Occurrence not found." });

        const comment = occurrence.comments.id(commentId);
        if (!comment) return res.status(404).json({ message: "Comment not found." });

        // Create moderation log
        await ModerationLog.create({
            moderatorId,
            targetType: 'comment',
            targetId: commentId,
            reason
        });

        // Notify comment author
        await Notification.create({
            userId: comment.authorId,
            occurrenceId: occurrence._id,
            message: `Your comment on "${occurrence.title}" was removed by a moderator. Reason: ${reason}`,
            type: "NEW_COMMENT"
        });

        comment.deleteOne();
        await occurrence.save();

        res.status(200).json({ message: "Comment deleted by moderator." });

    } catch (error) {
        console.error("Moderation comment delete error:", error);
        res.status(500).json({ message: "Error deleting comment." });
    }
};

module.exports = moderationController;