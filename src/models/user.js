const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Username required'],
  },
  email: {
    type: String,
    required: [true, 'User email required'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'User name required'],
  },
  createdAt: {
    type: Date,
    required: [true, 'Account creation date required'],
  },
  img: {
    type: String,
    required: [true, 'Profile pic required required'],
  },
});
const User = mongoose.model('Users', userSchema);
module.exports = User;
