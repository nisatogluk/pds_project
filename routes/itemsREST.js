const express = require('express');
const router = express.Router();
const itemRESTController = require('../controllers/itemRESTController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/occurrence', authMiddleware.verifyToken, itemRESTController.createOccurrence);
router.get('/my-occurrences', authMiddleware.verifyToken, itemRESTController.getMyOccurrences);
router.get('/map', itemRESTController.getPublicMapOccurrences); // Mapa é público, não precisa de token
router.get('/:id', itemRESTController.show); // Detalhes são públicos

router.put('/:id/status', authMiddleware.verifyToken, itemRESTController.updateStatus);
router.post('/:id/comments', authMiddleware.verifyToken, itemRESTController.addComment);
router.delete('/:id/comments/:commentId', authMiddleware.verifyToken, itemRESTController.deleteComment);

module.exports = router;