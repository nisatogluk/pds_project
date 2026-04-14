var mongoose = require('mongoose');

// Subesquema para comentários
var CommentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    authorName: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

var OccurrenceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    photoUrl: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['PENDING', 'UNDER_ANALYSIS', 'IN_RESOLUTION', 'APPROVED', 'REJECTED', 'SOLVED'],
        default: 'PENDING'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    // [US#XX] Comments
    comments: [CommentSchema]
});

module.exports = mongoose.model('Occurrence', OccurrenceSchema);