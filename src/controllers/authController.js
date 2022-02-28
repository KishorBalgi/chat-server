const User = require('../models/user');
const AppError = require('../utils/appErrors');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');
const sendEmail = require('../utils/email');
const catchAsync = require('../utils/catchAsync');
// JWT:
const signToken = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SK, {
    expiresIn: process.env.JWT_EXP,
  });
  return token;
};
// Cookie Options for JWT:
const cookieOps = {
  expires: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
  httpOnly: true,
  secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
};

const sendToken = (user, statusCode, res) => {
  user.password = undefined;
  const token = signToken(user._id);
  res.cookie('jwt', token, cookieOps);
  res.status(statusCode).json({
    status: 'success',
    user: {
      email: user.email,
      username: user.name,
      img: user.img,
    },
  });
};

// Protect:
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(new AppError('You are not logged in. Please login to access.'));
  }
  // Validate the token:
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SK);
  // Check whether user exists:
  const user = await User.findById(decoded.id);
  if (user.checkJWTExpired(decoded.iat)) {
    return next(
      new AppError('User password was changed. Login again to access.', 401)
    );
  }
  if (!user) {
    return next(new AppError('User no longer exists!', 404));
  }
  req.user = user;
  next();
});

// Sign-Up:
exports.signup = catchAsync(async (req, res, next) => {
  const data = {
    name: req.body.name,
    email: req.body.email,
    createdAt: Date.now(),
    password: req.body.password,
  };
  const newUser = await User.create(data);
  try {
    await sendEmail({
      email: data.email,
      subject: 'Welcome to Chat App',
      message: `Your account was successfully created.Happy chating!`,
    });
  } catch (err) {
    return next(new AppError(`Could not send email.`), 500);
  }
  sendToken(newUser, 201, res);
});

// Login:
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Email and Password required.', 400));
  }
  const user = await User.findOne({ email: email }).select('+password');
  if (!user || !(await user.checkPassword(password, user.password))) {
    return next(new AppError('Invalid E-mail or Password', 401));
  }
  sendToken(user, 200, res);
});

// Logout:
exports.logout = (req, res, next) => {
  res.cookie('jwt', 'userloggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200);
};

// Forgot Password:
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('User not found!', 404));
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/auth/resetPassword/${resetToken}`;
  try {
    await sendEmail({
      email: 'kishorbalgi@gmail.com',
      subject: 'Password reset request.',
      message: `To reset your password click ${resetURL}`,
    });
    res.status(200).json({
      status: 'success',
      message: 'Reset e-mail sent to user e-mail.',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError(`Could not send email.`), 500);
  }
});

// Reset Password:
exports.resetPassword = catchAsync(async (req, res, next) => {
  // Hash the token recived:
  const hashedToken = crypto
    .createHash('SHA256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(new AppError('Invalid token or token expired', 404));
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  sendToken(user, 200, res);
});

// Update Password:
exports.updatePassword = catchAsync(async (req, res, next) => {
  // Verify users old password:
  const user = await User.findById(req.user._id).select('+password');
  if (
    !user ||
    !(await user.checkPassword(req.body.currPassword, user.password))
  ) {
    return next(new AppError('Invalid password.', 401));
  }
  // Check for same passwords:
  if (req.body.currPassword === req.body.newPassword) {
    return next(
      new AppError('Your new password is same as old password.', 400)
    );
  }
  user.password = req.body.newPassword;
  await user.save();
  sendToken(user, 200, res);
});

// is Logged In:
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt) {
    // Validate the token:
    const decoded = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SK
    );
    // Check whether user exists:
    const user = await User.findById(decoded.id);
    if (user.checkJWTExpired(decoded.iat)) {
      return next(
        new AppError('User password was changed. Login again to access.', 401)
      );
    }
    if (!user) {
      return next(new AppError('User no longer exists!', 404));
    }
    res.status(200).json({
      status: 'success',
      user: { username: user.name, email: user.email, img: user.img },
    });
  } else {
    res.status(200).json({
      status: 'success',
    });
  }
});
