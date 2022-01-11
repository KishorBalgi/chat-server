const User = require('../models/user');
const bcrypt = require('bcrypt');
const AuthFeatures = require('../utils/authFeatures');
const AppError = require('../utils/appErrors');
const catchAsync = (fn) => {
  return (req, res, next) => fn(req, res, next).catch(next);
};
exports.signup = catchAsync(async (req, res, next) => {
  const data = {
    name: req.body.name,
    email: req.body.email,
    createdAt: req.body.createdAt,
    password: await bcrypt.hash(req.body.password, await bcrypt.genSalt(5)),
    img: 'https://i.ibb.co/d5RgxfH/user-blank.png',
  };

  const user = await User.create(data, (err, user) => {
    if (err) return next(new AppError('Email already taken', 400));
    else {
      res.status(200).json({
        status: 'success',
        user: { uid: user._id, img: user.img },
        message: 'Account created successfully.',
      });
    }
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const user = new AuthFeatures(User.find(), req.body).find();
  const userArr = await user.users;
  const userData = userArr[0];
  if (!userData) {
    return next(new AppError('Invalid E-Mail', 400));
  }
  await bcrypt.compare(req.body.password, userData.password, (err, isTrue) => {
    if (isTrue) {
      res.status(200).json({
        status: 'success',
        message: 'Verified successfully.',
        user: {
          name: userData.name,
          img: userData.img,
          uid: userData._id,
        },
      });
    } else {
      return next(new AppError('Invalid Password', 400));
    }
  });
});
