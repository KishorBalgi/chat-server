const mongoose = require('mongoose');

const chatChunkSchema = new mongoose.Schema({
  room: {
    type: String,
    required: [true, 'A chat chunk requires a room'],
  },
  chats: [{ type: mongoose.Schema.ObjectId, ref: 'UserChat' }],
  timestamp: {
    type: String,
    required: [true, 'A chat chunk requires a date'],
  },
});
chatChunkSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'chats',
  });
  next();
});
chatChunkSchema.index({ room: 'text', timestamp: 'text' });
const ChatChunk = mongoose.model('ChatChunk', chatChunkSchema);

module.exports = ChatChunk;
