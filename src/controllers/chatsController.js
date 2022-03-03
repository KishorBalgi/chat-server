const Chatlist = require('../models/chat-list');
const Chats = require('../models/chats');
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

exports.getChatHistory = catchAsync(async (req, res, next) => {
  if (!req.body.id) {
    return next(new AppError('Please define a user id', 400));
  }
  const history = await Chats.findOne({
    users: { $all: [req.user._id, req.body.id] },
  });
  if (!history) {
    res.status(200).json({
      status: 'success',
      chats: null,
    });
  }
  res.status(200).json({
    status: 'success',
    chats: history.chats,
  });
});
