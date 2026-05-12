const express = require('express');
const router = express.Router();
const itemRESTController = require('../controllers/itemRESTController');
const { verifyToken: authMiddleware } = require('../middleware/authMiddleware');

router.post('/occurrence', authMiddleware, itemRESTController.createOccurrence);
router.get('/my-occurrences', authMiddleware, itemRESTController.getMyOccurrences);
router.get('/map', itemRESTController.getPublicMapOccurrences);
router.get('/:id', itemRESTController.show);

router.put('/:id/status', authMiddleware, itemRESTController.updateStatus);
router.post('/:id/comments', authMiddleware, itemRESTController.addComment);
router.delete('/:id/comments/:commentId', authMiddleware, itemRESTController.deleteComment); // Esta linha!

module.exports = router;