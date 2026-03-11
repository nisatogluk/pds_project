var mongoose = require('mongoose');

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
  role: { 
    type: String, 
    default: 'Contributor' 
  },
  // Campo atualizado para bater com o Diagrama de Estados
  status: { 
    type: String, 
    enum: ['PENDING', 'ACTIVE', 'DISABLED', 'SUSPENDED'], 
    default: 'PENDING' 
  }
});

module.exports = mongoose.model('User', UserSchema);