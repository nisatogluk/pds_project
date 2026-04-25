const express = require('express');
const router = express.Router();
const itemRESTController = require('../controllers/itemRESTController');
const authMiddleware = require('../middleware/authMiddleware');

// Verificação de segurança (DEBUG): se o servidor der erro aqui, ele vai dizer qual função falta
console.log("Checking controller functions...");
console.log("addComment exists:", !!itemRESTController.addComment);
console.log("verifyToken exists:", !!authMiddleware.verifyToken);

router.post('/occurrence', itemRESTController.createOccurrence);
router.get('/my-occurrences', itemRESTController.getMyOccurrences);

// Linha 12 (Onde dava o erro)
router.post('/occurrence/:id/comments', authMiddleware.verifyToken, itemRESTController.addComment);
router.delete('/occurrence/:id/comments/:commentId', authMiddleware.verifyToken, itemRESTController.deleteComment);

router.put('/:id/status', authMiddleware.verifyToken, authMiddleware.isAdmin, itemRESTController.updateStatus);

module.exports = router;