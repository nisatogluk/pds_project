const express = require('express');
const router = express.Router();
const mapController = require('../controllers/mapController');

// Geocode
router.get('/geocode', mapController.geocode);

// Reverse geocode
router.get('/reverse', mapController.reverse);

module.exports = router;