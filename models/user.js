var mongoose = require('mongoose');

const { STATUS, ROLES } = require('../constants');

var UserSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  status: {
  type: String,
  enum: Object.values(STATUS), 
  default: STATUS.PENDING
},
role: {
  type: String,
  enum: Object.values(ROLES),
  default: ROLES.CONTRIBUTOR
}
});

module.exports = mongoose.model('User', UserSchema);
var mongoose = require('mongoose');  
var UserSchema = new mongoose.Schema({  
  name: String,
  email: String,
  role: String,
  password: String
});
mongoose.model('User', UserSchema);

module.exports = mongoose.model('User');
