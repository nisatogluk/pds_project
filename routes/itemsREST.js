
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
router.post('/occurrence', itemRESTController.createOccurrence);
router.get('/my-occurrences', itemRESTController.getMyOccurrences);

module.exports = router;