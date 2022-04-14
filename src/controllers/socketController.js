const Chats = require('../models/chats');
const UserChat = require('../models/userChat');
const crypto = require('crypto');
const catchAsync = require('../utils/catchAsync');
const ChatChunk = require('../models/chatChunk');

// Join Room:
exports.joinRoom = catchAsync(async (user1, user2) => {
  let chats = await Chats.findOne({ users: { $all: [user1, user2] } });
  if (!chats) {
    const room = crypto
      .createHash('SHA256')
      .update(user1 + user2)
      .digest('hex');
    chats = await Chats.create({ users: [user1, user2], room });
  }
  return chats.room;
});

// Store chat to DB:
exports.storeChat = catchAsync(async (msg, room, id) => {
  const today = new Date().toLocaleDateString();
  const chat = await UserChat.create({ user: id, message: msg });
  let chunk = await ChatChunk.findOne({ room: room, timestamp: today });
  if (!chunk) chunk = await ChatChunk.create({ room: room, timestamp: today });
  chunk.chats.push(chat._id);
  await chunk.save();
  const chats = await Chats.findOneAndUpdate(
    {
      room,
      chats: { $ne: chunk._id },
    },
    { $push: { chats: chunk._id } }
  );
});
