var mongoose = require('mongoose');
const { STATUS, ROLES } = require('../constants');

var UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    status: {
        type: String,
        enum: Object.values(STATUS),
        default: STATUS.PENDING
    },
    role: {
        type: String,
        enum: Object.values(ROLES),
        default: ROLES.CONTRIBUTOR
    },
    resetPasswordToken: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
    address: String,
    city: String,
    postalCode: String,
    phoneNumber: String,
    profilePhoto: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);