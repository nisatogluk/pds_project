
const express = require('express');
const router = express.Router();
const itemRESTController = require('../controllers/itemRESTController');
const authController = require('../controllers/authController');
/*
router.get('/' ,itemRESTController.showAll );
router.get('/show/:id', itemRESTController.show );
router.post('/create', itemRESTController.create);
router.put('/edit/:id', itemRESTController.edit);
router.delete('/delete/:id', itemRESTController.delete );
*/
const verifyToken = require('../middleware/authMiddleware');
router.post('/occurrence', verifyToken, itemRESTController.createOccurrence);
//router.post('/occurrence', itemRESTController.createOccurrence);  
router.get('/my-occurrences', verifyToken, itemRESTController.getMyOccurrences);
router.get('/map', itemRESTController.getPublicMapOccurrences);
router.get('/:id', itemRESTController.show);//see more
module.exports = router;