const Chatlist = require('../models/chat-list');
const Chats = require('../models/chats');
const AppError = require('../utils/appErrors');
const catchAsync = require('../utils/catchAsync');

exports.getChats = catchAsync(async (req, res, next) => {
  const id = req.user._id;
  let chats = await Chats.find({
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
  const chatlist = await Chatlist.findOneAndUpdate(
    { user: id },
    { chats: idArr },
    { new: true }
  );
  res.status(200).json({
    status: 'success',
    chatlist: chatlist.chats,
    chatsID: chatlist._id,
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
  } else {
    res.status(200).json({
      status: 'success',
      users: history.users,
      chats: history.chats,
    });
  }
});
