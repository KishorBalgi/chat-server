const mongoose = require('mongoose');

const chatsSchema = new mongoose.Schema({
  room: {
    type: String,
    required: [true, 'A chat must have a room'],
    unique: [true, 'A chat room must be unique'],
  },
  users: [{ type: mongoose.Schema.ObjectId, ref: 'Users' }],
  chats: [{ type: mongoose.Schema.ObjectId, ref: 'UserChat' }],
  lastUpdated: {
    type: Date,
  },
});

chatsSchema.pre('findOneAndUpdate', function (next) {
  this.set({ lastUpdated: new Date() });
  next();
});

chatsSchema.pre(/^findOne/, function (next) {
  this.populate({
    path: 'chats',
  }).populate({
    path: 'users',
    select: 'name photo',
  });
  next();
});

const Chats = mongoose.model('Chats', chatsSchema);

module.exports = Chats;
