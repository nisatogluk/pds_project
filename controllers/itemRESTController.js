var mongoose = require('mongoose');
var Occurrence = require('../models/occurrence');
var User = require('../models/user');
var itemRESTController = {};

// [US#20] Create Occurrence
itemRESTController.createOccurrence = async function(req, res, next) {
    try {
        const { title, description, category, location, photoUrl, userId } = req.body;
        const newOccurrence = new Occurrence({
            title, description, category, location, photoUrl,
            status: "PENDING",
            userId: userId || req.userId
        });
        const savedOccurrence = await newOccurrence.save();
        res.status(201).json(savedOccurrence);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// [US#22] Get My Occurrences
itemRESTController.getMyOccurrences = async function(req, res, next) {
    try {
        const occurrences = await Occurrence.find({ userId: req.userId }).sort({ createdAt: -1 });
        res.json(occurrences);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// [US#XX] Add Comment
itemRESTController.addComment = async function(req, res, next) {
    try {
        const { text } = req.body;
        const user = await User.findById(req.user.id);
        const occurrence = await Occurrence.findById(req.params.id);
        
        const newComment = { text, authorId: req.user.id, authorName: user.name, createdAt: new Date() };
        occurrence.comments.push(newComment);
        await occurrence.save();
        res.status(201).json(newComment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// [US#XX] Delete Comment
itemRESTController.deleteComment = async function(req, res, next) {
    try {
        const occurrence = await Occurrence.findById(req.params.id);
        occurrence.comments.pull(req.params.commentId);
        await occurrence.save();
        res.status(200).json({ message: 'Comment deleted.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// [US#21] Update Status (Tua tarefa atual!)
itemRESTController.updateStatus = async function(req, res, next) {
    try {
        const updated = await Occurrence.findByIdAndUpdate(
            req.params.id, { status: req.body.status }, { new: true }
        );
        res.status(200).json({ message: "Status updated!", data: updated });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = itemRESTController;