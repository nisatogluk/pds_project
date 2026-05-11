var mongoose = require('mongoose');
var Item = require('../models/item'); 
var Occurrence = require('../models/occurrence');
var itemRESTController = {};
var User = require('../models/user'); // já deve existir ou adiciona esta linha

// mostra todos items
/*itemRESTController.showAll = async function(req, res,next){
    try {
        const items = await Item.find({})
        console.log(items);
        res.json(items);
    } catch(err){
        console.log('Error reading from database');
        next(err);
    }
}

itemRESTController.show = async function(req, res, next){
    try {
        const item = await Item.findOne({_id: req.params.id})
        console.log(item);
        res.json(item);
    } catch(err){
        console.log('Error reading from database');
        next(err);
    }
}

itemRESTController.create = async function(req, res, next){
    try {
        var item = new Item(req.body);
        const itemSaved = await item.save()
        console.log(itemSaved);
        res.json(itemSaved);
    } catch(err){
        console.log('Error saving to database');
        next(err);
    }
}

itemRESTController.edit = async function(req, res, next){
    try {
        const editedItem = await Item.findByIdAndUpdate(req.body._id, req.body, { new: true } )
        console.log(editedItem);
        res.json(editedItem);
    } catch(err){
        console.log('Error updating database');
        next(err);
    }
}

itemRESTController.delete = async function(req, res, next){
    try {
        const deletedItem = await Item.findByIdAndDelete({_id: req.params.id})
        console.log(deletedItem);
        res.json(deletedItem);
    } catch(err){
        console.log('Error removing from database');
        next(err);
    }
}

// [US#20] Create Occurrence
itemRESTController.createOccurrence = async function (req, res, next) {
    
    try {

        const { title, description, category, location, latitude,
            longitude, photoUrl } = req.body;

        const currentUserId = req.user ? (req.user.id || req.user._id) : null;

        if (!currentUserId) {
            return res.status(401).json({ message: " (Token is missing or invalid.)." });
        }

        if (!title || !category || !location || !photoUrl) {
            return res.status(400).json({
                message: 'All required fields must be filled.'
            });
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
        console.log("Ocorrência gravada com o ID:", newOccurrence.userId); // Isto ajuda a ver no terminal
        res.status(201).json(newOccurrence);
    } catch (error) {
        console.error("ERROR BODY:", error);

        res.status(500).json({
            message: error.message,
            details: error
        });
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
        // filter
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
//See more Link with related place
itemRESTController.show = async function (req, res, next) {
    try {

        const occurrence = await Occurrence.findById(req.params.id);

        if (!occurrence) {
            return res.status(404).json({ message: "Cannot found!" });
        }
        console.log(occurrence);
        res.json(occurrence);
    } catch (err) {
        console.log('Database error');
        res.status(500).json({ error: err.message });
    }
};
module.exports = itemRESTController;