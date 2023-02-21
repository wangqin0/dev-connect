const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name : {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  // avatar in the User model so that it's always accessible
  avatar: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now(),
  }
});

// ?
module.exports = User = mongoose.model('user', UserSchema);
