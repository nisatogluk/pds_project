var mongoose = require('mongoose');

var OccurrenceSchema = new mongoose.Schema({

    title: {

        type: String,

        required: true

    },

    description: {

        type: String,

        required: false

    },

    category: {

        type: String,

        required: true

    },

    location: {

        type: String,

        required: true // US#20 restriction



    },
    longitude:{
        type:Number,
        required:false
    },
    latitude:{
        type:Number,
        required:false
    },

    photoUrl: {

        type: String,

        required: true // US#20 restriction

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

    }

});

module.exports = mongoose.model('Occurrence', OccurrenceSchema);