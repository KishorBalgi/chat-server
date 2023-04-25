const Chatlist = require('../models/chat-list');
const Chats = require('../models/chats');
const UserChats = require('../models/userChat');
const AppError = require('../utils/appErrors');
const catchAsync = require('../utils/catchAsync');
const path = require('path');
const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const crypto = require('crypto');
const mongoose = require('mongoose');
const conn = mongoose.connection;
const Grid = require('gridfs-stream');

// DB:
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
// GridFS Stream:
let gfs, gridfsBucket;
conn.once('open', function () {
  gridfsBucket = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'uploads',
  });
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection('uploads');
});
// Creating a GridFS Storage:
const storage = new GridFsStorage({
  url: DB,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'uploads',
        };
        resolve(fileInfo);
      });
    });
  },
});

exports.upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
});

// Get Chats of a user:
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

// Get Chat from a specific room:
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

exports.deleteMessage = catchAsync(async (req, res, next) => {
  if (!req.params.recId && !req.params.msgId) {
    return next(new AppError('Chat id required', 400));
  }
  await UserChats.findByIdAndDelete(req.params.msgId);
  await Chats.findOneAndUpdate(
    {
      users: { $all: [req.user._id, req.params.recId] },
    },
    { $pull: { chats: req.params.msgId } }
  );
  res.status(200).json({ status: 'success' });
});

// exports.deleteChatFormChatList = catchAsync(async (req, res, next) => {
//   if (!req.body.id) {
//     return next(
//       new AppError('Please define the id of the chat u want to delete', 400)
//     );
//   }
//   await Chatlist.findOneAndUpdate(
//     { user: req.user._id },
//     { $pull: { chats: req.body.id } }
//   );
//   res.status(200).json({
//     status: 'success',
//   });
// });

exports.uploadFile = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    filename: req.file.filename,
    filetype: req.file.mimetype,
  });
});

exports.getFile = catchAsync(async (req, res, next) => {
  gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
    if (err)
      return res.status(404).json({
        status: 'error',
        message: 'Something went wrong',
      });
    if (!file || file.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'File not found',
      });
    }
    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': 'attachment; filename=' + file.filename,
    });
    const readStream = gridfsBucket.openDownloadStream(file._id);

    readStream.on('error', function (err) {
      res.end();
    });
    readStream.pipe(res);
  });
});
