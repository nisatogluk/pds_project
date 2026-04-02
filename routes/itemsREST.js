const express = require('express');
const router = express.Router();
const itemRESTController = require('../controllers/itemRESTController');
const verifyToken = require('../middleware/authMiddleware'); 

router.get('/', itemRESTController.showAll);
router.get('/show/:id', itemRESTController.show);
router.post('/create', itemRESTController.create);
router.put('/edit/:id', itemRESTController.edit);
router.delete('/delete/:id', itemRESTController.delete);

router.post('/occurrence', verifyToken, itemRESTController.createOccurrence);
router.get('/my-occurrences', verifyToken, itemRESTController.getMyOccurrences);

module.exports = router;