const fs = require('fs');
const User = require('../models/user');
const AppError = require('../utils/appErrors');
const catchAsync = require('../utils/catchAsync');
const multer = require('multer');
const sharp = require('sharp');
// Multer:
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) cb(null, true);
  else cb(new AppError('Please upload an image', 400), false);
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
exports.uploadImage = upload.single('photo');
// Resize Images:
exports.resizeProfilePic = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = 'tempProfilePic.jpeg';
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 100 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});
// Data fileter:
const filterObj = (obj, filters) => {
  const fltrObj = {};
  Object.keys(obj).forEach((e) => {
    if (filters.includes(e)) {
      fltrObj[e] = obj[e];
    }
  });
  return fltrObj;
};
// Search user by ID:
exports.searchUserById = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.body.id).select('name photo');
  res.status(200).json({
    status: 'success',
    user,
  });
});
// Search users:
exports.searchUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({
    name: { $regex: req.body.search, $options: 'i' },
  });
  res.status(200).json({
    status: 'success',
    users,
  });
});
// Delete Me:
exports.deleteMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id)
    .select('+password')
    .select('+active');
  if (!user || !(await user.checkPassword(req.body.password, user.password))) {
    return next(new AppError('Invalid e-mail or password', 404));
  }
  await user.update({ active: false });
  res.status(204).json({
    status: 'success',
    message: 'User account deleted successfully',
  });
});
// Update Me:
exports.updateMe = catchAsync(async (req, res, next) => {
  const data = filterObj(req.body, ['email', 'name']);
  try {
    const user = await User.findByIdAndUpdate(req.user._id, data, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'success',
      user: {
        username: user.name,
        email: user.email,
        img: user.img,
      },
    });
  } catch (err) {
    next(new AppError('E-mail already taken', 404));
  }
});
// Upload Profile Pic:
exports.uploadProfilePic = catchAsync(async (req, res, next) => {
  let user;
  if (req.file) {
    const profilePicBuffer = fs.readFileSync(
      'public/img/users/tempProfilePic.jpeg'
    );
    user = await User.findByIdAndUpdate(
      req.user._id,
      { photo: profilePicBuffer },
      { new: true }
    );
  }
  if (req.body.remove) {
    user = await User.findByIdAndUpdate(
      req.user._id,
      { $unset: { photo: 1 } },
      { new: true }
    );
  }
  res.status(200).json({
    status: 'success',
    photo: user.photo,
  });
});
