var mongoose = require('mongoose');
var Occurrence = require('../models/occurrence');
var User = require('../models/user');
var Notification = require('../models/notification');

var itemRESTController = {};

// [US#20] Create Occurrence
itemRESTController.createOccurrence = async function (req, res, next) {
    try {
        const { title, description, category, location, latitude, longitude, photoUrl } = req.body;
        const currentUserId = req.user ? (req.user.id || req.user._id) : null;

        if (!currentUserId) {
            return res.status(401).json({ message: "Token is missing or invalid." });
        }

        if (!title || !category || !location || !photoUrl) {
            return res.status(400).json({ message: 'All required fields must be filled.' });
        }

        const newOccurrence = new Occurrence({
            title,
            description,
            category,
            location,
            latitude,
            longitude,
            photoUrl,
            status: "PENDING",
            userId: currentUserId
        });

        await newOccurrence.save();
        res.status(201).json(newOccurrence);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// [US#22] Get My Occurrences
itemRESTController.getMyOccurrences = async function (req, res, next) {
    try {
        const userId = req.user ? (req.user.id || req.user._id) : null;
        const occurrences = await Occurrence.find({ userId: userId }).sort({ createdAt: -1 });
        res.json(occurrences);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// [US#23][RF8] Get Public Occurrences for Map
itemRESTController.getPublicMapOccurrences = async function (req, res, next) {
    try {
        const visibleStatuses = ['APPROVED', 'IN_RESOLUTION', 'SOLVED'];
        const occurrences = await Occurrence.find({
            status: { $in: visibleStatuses },
            latitude: { $exists: true, $ne: null },
            longitude: { $exists: true, $ne: null }
        }).select('title status photoUrl latitude longitude _id');

        res.json(occurrences);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// See more Link with related place
itemRESTController.show = async function (req, res, next) {
    try {
        const occurrence = await Occurrence.findById(req.params.id);
        if (!occurrence) {
            return res.status(404).json({ message: "Occurrence not found!" });
        }
        res.json(occurrence);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Function to update the occurrence status
itemRESTController.updateStatus = async function(req, res) {
  try {
    const { status } = req.body;
    
    const updatedOccurrence = await Occurrence.findByIdAndUpdate(
      req.params.id, 
      { status: status }, 
      { new: true }
    );

    if (!updatedOccurrence) {
      return res.status(404).json({ message: "Occurrence not found." });
    }

    res.status(200).json(updatedOccurrence);
  } catch (error) {
    res.status(500).json({ message: "Error updating status.", error: error.message });
  }
};

module.exports = itemRESTController;