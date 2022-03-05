const mongoose = require('mongoose');

const chatListSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'Users',
    required: [true, 'Chat list must have a user id'],
  },
  chats: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Users',
    },
  ],
});

chatListSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'chats',
    select: 'name img',
  });
  next();
});

const Chatlist = mongoose.model('Chatlist', chatListSchema);
module.exports = Chatlist;
