const ChatList = require('../models/chat-list');
const Chats = require('../models/chats');
const UserChat = require('../models/userChat');
const crypto = require('crypto');
const catchAsync = require('../utils/catchAsync');

// Join Room:
exports.joinRoom = catchAsync(async (user1, user2) => {
  let chats = await Chats.findOne({ users: { $all: [user1, user2] } });
  if (!chats) {
    const room = crypto.randomBytes(10).toString('hex');
    chats = await Chats.create({ users: [user1, user2], room });
  }
  return chats.room;
});

// Store chat to DB:
exports.storeChat = catchAsync(async (msg, room, id) => {
  const chat = await UserChat.create({ user: id, message: msg });
  await Chats.findOneAndUpdate({ room }, { $push: { chats: chat._id } });
});

// Update DB on disconnect:
exports.updateDBOnDisconnect = catchAsync(async (id) => {
  const chats = await Chats.find({
    users: { $all: [id] },
    lastUpdated: { $exists: true },
  })
    .sort({ lastUpdated: -1 })
    .select('-_id -chats -lastUpdated -room -__v');
  const idArr = chats.map((u) => {
    const uarr = u.users;
    const i = uarr.find((a) => a.toString() != id.toString());
    return i;
  });
  // console.log(usersArr);

  const chatlist = await ChatList.findOneAndUpdate(
    { user: id },
    { chats: idArr }
  );
});
