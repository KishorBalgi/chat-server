const Chats = require('../models/chats');
const UserChat = require('../models/userChat');
const crypto = require('crypto');

// Join Room:
exports.joinRoom = async (user1, user2) => {
  let chats = await Chats.findOne({ users: { $all: [user1, user2] } });
  if (!chats) {
    const room = crypto.randomBytes(10).toString('hex');
    chats = await Chats.create({ users: [user1, user2], room });
  }
  return chats.room;
};

// Store chat to DB:
exports.storeChat = async (msg, room, id) => {
  const chat = await UserChat.create({ user: id, message: msg });
  const chatsDB = await Chats.findOneAndUpdate(
    { room },
    { $push: { chats: chat._id } }
  );
};
