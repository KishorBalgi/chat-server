const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'Users',
    required: [true, 'A chat must belong to a user'],
  },
  message: {
    type: String,
    required: [true, 'A chat must have a message'],
  },
  timestamp: {
    type: Date,
  },
});

chatSchema.pre('save', function (next) {
  this.timestamp = new Date();
  next();
});

const UserChat = mongoose.model('UserChat', chatSchema);

module.exports = UserChat;
