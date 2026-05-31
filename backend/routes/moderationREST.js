const express = require('express');
const router = express.Router();
const moderationController = require('../controllers/moderationController');
const { verifyToken, isModerator } = require('../middleware/authMiddleware');

// Delete occurrence (moderator)
router.delete('/occurrences/:id', verifyToken, isModerator, moderationController.deleteOccurrence);

// Delete comment (moderator)
router.delete('/occurrences/:id/comments/:commentId', verifyToken, isModerator, moderationController.deleteComment);

// Get moderation stats
router.get('/stats', verifyToken, isModerator, moderationController.getStats);

module.exports = router;