var mongoose = require('mongoose');
var ItemSchema = new mongoose.Schema({
    title: String,
    description: String,
    category: String,
    location: String,
    photoUrl: String,
    
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } 

var ItemSchema = new mongoose.Schema({
    name: String,
    quantity: Number
});

module.exports = mongoose.model('Item', ItemSchema);