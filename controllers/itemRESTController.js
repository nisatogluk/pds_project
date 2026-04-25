var mongoose = require('mongoose');
var Occurrence = require('../models/occurrence');
var User = require('../models/user');
var Notification = require('../models/notification');

var itemRESTController = {};

// [US#20] Create Occurrence
itemRESTController.createOccurrence = async function (req, res) {
  try {
    const newOccurrence = new Occurrence({
      ...req.body,
      userId: req.user.id 
    });
    await newOccurrence.save();
    res.status(201).json(newOccurrence);
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


        if (occurrence.userId.toString() !== req.user.id.toString()) {
            const novaNotificacao = new Notification({
                userId: occurrence.userId, 
                occurrenceId: occurrence._id,
                message: `${user.name} commented on your occurrence.`,
                type: 'NEW_COMMENT'
            });
            await novaNotificacao.save();
        }

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

itemRESTController.updateStatus = async function (req, res) {
  try {
    const { status } = req.body;
    const { id } = req.params;

    // Find the occurrence first to get the owner's ID
    const occurrence = await Occurrence.findById(id);

    if (!occurrence) {
      return res.status(404).json({ message: "Occurrence not found" });
    }

    // Update the occurrence status
    occurrence.status = status;
    await occurrence.save();

    // Create a new notification for the owner of the occurrence
    const newNotification = new Notification({
      userId: occurrence.userId, 
      occurrenceId: occurrence._id,
      message: `The status of your occurrence "${occurrence.title}" was updated to ${status}.`,
      type: 'STATUS_UPDATE'
    });

    // Save notification to the database
    await newNotification.save();

    res.status(200).json({ message: "Success! Status updated and user notified." });
  } catch (error) {
    // If validation fails (like the enum error), it will show here
    res.status(500).json({ error: error.message });
  }
};

module.exports = itemRESTController;