const express = require('express');
const router = express.Router();
const itemRESTController = require('../controllers/itemRESTController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Create a new occurrence (requires authentication)
router.post('/', verifyToken, itemRESTController.createOccurrence);

// Get user's occurrences (requires authentication)
router.get('/my-occurrences', verifyToken, itemRESTController.getMyOccurrences);

// Get all occurrences for map (public)
router.get('/map', itemRESTController.getPublicMapOccurrences);

// Get specific occurrence details (public)
router.get('/:id', itemRESTController.show);

// Update occurrence status (requires authentication)
router.put('/:id/status', verifyToken, itemRESTController.updateStatus);

// Add comment to occurrence (requires authentication)
router.post('/:id/comments', verifyToken, itemRESTController.addComment);

// Delete comment from occurrence (requires authentication)
router.delete('/:id/comments/:commentId', verifyToken, itemRESTController.deleteComment);

// Update occurrence (requires authentication + ownership validation)
router.put('/:id', verifyToken, itemRESTController.updateOccurrence);

// Delete occurrence (requires authentication + ownership validation)
router.delete('/:id', verifyToken, itemRESTController.deleteOccurrence);
  
module.exports = router;