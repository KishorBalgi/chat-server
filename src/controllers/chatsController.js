const Chatlist = require('../models/chat-list');
const AppError = require('../utils/appErrors');
const catchAsync = require('../utils/catchAsync');

exports.getChats = catchAsync(async (req, res, next) => {
  const chats = await Chatlist.findOne({ user: req.user._id });
  res.status(200).json({
    status: 'success',
    chatlist: chats.chats,
    chatsID: chats._id,
  });
});
