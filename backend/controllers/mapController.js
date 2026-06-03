require('dotenv').config();
const axios = require('axios');

const ORS_API_KEY = process.env.ORS_API_KEY;

const mapController = {};

mapController.geocode = async function(req, res) {
    try {
        const { text } = req.query;
        if (!text) return res.status(400).json({ message: 'text query param is required' });

        const response = await axios.get('https://api.openrouteservice.org/geocode/search', {
            params: {
                api_key: ORS_API_KEY,
                text,
                size: 5
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Geocode error:', error.message);
        res.status(500).json({ message: 'Geocoding failed' });
    }
};

mapController.reverse = async function(req, res) {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) return res.status(400).json({ message: 'lat and lon query params are required' });

        const response = await axios.get('https://api.openrouteservice.org/geocode/reverse', {
            params: {
                api_key: ORS_API_KEY,
                'point.lat': lat,
                'point.lon': lon,
                size: 1
            }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Reverse geocode error:', error.message);
        res.status(500).json({ message: 'Reverse geocoding failed' });
    }
};

module.exports = mapController;