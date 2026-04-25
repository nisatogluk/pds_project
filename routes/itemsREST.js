const express = require('express');
const router = express.Router();
const itemRESTController = require('../controllers/itemRESTController');
const authMiddleware = require('../middleware/authMiddleware');

// [US#20] Create Occurrence
router.post('/occurrence', authMiddleware, itemRESTController.createOccurrence);

// [US#22] Get My Occurrences
router.get('/my-occurrences', authMiddleware, itemRESTController.getMyOccurrences);

// [US#XX] Add Comment
router.post('/occurrence/:id/comments', authMiddleware, itemRESTController.addComment);

// [US#XX] Delete Comment
router.delete('/occurrence/:id/comments/:commentId', authMiddleware, itemRESTController.deleteComment);

// [US#21] Update Status - THIS WAS MISSING!
router.put('/:id/status', authMiddleware, itemRESTController.updateStatus);

module.exports = router;