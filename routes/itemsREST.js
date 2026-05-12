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
const authController = require('../controllers/authController');

router.get('/' ,itemRESTController.showAll );
router.get('/show/:id', itemRESTController.show );
router.post('/create', itemRESTController.create);
router.put('/edit/:id', itemRESTController.edit);
router.delete('/delete/:id', itemRESTController.delete );
  
module.exports = router;

