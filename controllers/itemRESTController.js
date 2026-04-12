var mongoose = require('mongoose');
//var Item = require('../models/item');
var Occurrence = require('../models/occurrence');//new occurence file
var itemRESTController = {};

// mostra todos items 
/*itemRESTController.showAll = async function(req, res,next){
    try {
        const dbitems = await Item.find({})
        console.log(dbitems);
        res.json(dbitems);
    } catch(err){
        console.log('Erro ao ler da base de dados');
        next(err);
    }
}

// mostra 1 item por id
itemRESTController.show = async function(req, res,next){
    try {
        const dbitems = await Item.findOne({_id:req.params.id})
        console.log(dbitems);
        res.json(dbitems);
    } catch(err){
        console.log('Erro ao ler da base de dados');
        next(err);
    }
}

// cria 1 item como resposta a um post de um form
itemRESTController.create = async function(req,res,next){
    try {
        var item = new Item(req.body);
        const itemSaved = await item.save()
        console.log(itemSaved);
        res.json(itemSaved);
    } catch(err){
        console.log('Erro ao gravar da base de dados');
        next(err);
    }
}

// edita 1 item como resposta a um post de um form editar
itemRESTController.edit = async function(req,res,next){
    try {
        const editedItem = await Item.findByIdAndUpdate(req.body._id, req.body, { new: true } )
        console.log(editedItem);
        res.json(editedItem);
    } catch(err){
        console.log('Erro ao atualizar na base de dados');
        next(err);
    }
}

// elimina 1 item
itemRESTController.delete = async function(req, res,next){
    try {
        const deleteItem = await Item.findByIdAndDelete({_id:req.params.id})
        console.log(deleteItem);
        res.json(deleteItem);
    } catch(err){
        console.log('Erro ao remover da base de dados');
        next(err);
    }
}
*/

// [US#20] Create Occurrence

itemRESTController.createOccurrence = async function (req, res, next) {
    try {
        
        const {
            title,
            description,
            category,
            location,
            latitude,
            longitude,
            photoUrl
        } = req.body;


        if (!category || !location || !photoUrl) {
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
            userId: req.user.id   
            
        });

        const savedOccurrence = await newOccurrence.save();
        res.status(201).json(savedOccurrence);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// [US#22] Get My Occurrences
itemRESTController.getMyOccurrences = async function (req, res, next) {
    try {

         
        const userId = req.user.id;   // ✅ FIX: correct source

        const occurrences = await Occurrence
            .find({ userId })
            .sort({ createdAt: -1 });
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