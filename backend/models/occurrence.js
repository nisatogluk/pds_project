var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
    text: { type: String, required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

var OccurrenceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: false },
    category: { type: String, required: true },
    location: { type: String, required: true },
    photoUrl: { type: String, required: true },
    status: {
        type: String,
        enum: ['PENDING', 'UNDER_ANALYSIS', 'IN_RESOLUTION', 'APPROVED', 'REJECTED', 'SOLVED'],
        default: 'PENDING'
    },
    longitude: { type: Number, required: false },
    latitude: { type: Number, required: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    votes: {
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]},
    createdAt: { type: Date, default: Date.now },
    comments: [CommentSchema]
});

module.exports = mongoose.model('Occurrence', OccurrenceSchema);