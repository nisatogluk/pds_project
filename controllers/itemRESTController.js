var mongoose = require('mongoose');
var Item = require('../models/item'); 
var Occurrence = require('../models/occurrence');
var itemRESTController = {};

itemRESTController.showAll = async function(req, res, next){
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

itemRESTController.createOccurrence = async function (req, res) {
    try {
        const { title, description, category, location, photoUrl } = req.body;

        const newOccurrence = new Item({
            title,
            description,
            category,
            location,
            photoUrl,
            // Alteração: Vamos garantir que o ID é lido corretamente
            userId: req.user.id || req.user._id 
        });

        await newOccurrence.save();
        console.log("Ocorrência gravada com o ID:", newOccurrence.userId); // Isto ajuda a ver no terminal
        res.status(201).json(newOccurrence);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

itemRESTController.getMyOccurrences = async function(req, res, next) {
    try {
        const userId = req.user.id;
        
        const occurrences = await Item.find({ userId: userId }).sort({ createdAt: -1 });
        
        res.json(occurrences);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = itemRESTController;