const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const validator = require('validator');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Username required'],
  },
  email: {
    type: String,
    required: [true, 'User email required'],
    unique: true,
    validate: [validator.isEmail, 'Please provide a valid E-mail'],
  },
  password: {
    type: String,
    required: [true, 'User password required'],
    minlength: 8,
    select: false,
  },
  createdAt: {
    type: Date,
    required: [true, 'Account creation date required'],
    select: false,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  img: {
    type: String,
    required: [true, 'Profile pic required required'],
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
  },
});
// ---Middlewares--- //
// Hide Inactive Accounts:
userSchema.pre(/^find/, function (next) {
  this.find({ active: true });
  next();
});
// Encrypt Password:
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Set Password Changed At:
userSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next();
  this.passwordChangedAt = Date.now();
  next();
});
// ---Schema Methods--- //
// Verify Password:
userSchema.methods.checkPassword = async function (reqPass, userPass) {
  return await bcrypt.compare(reqPass, userPass);
};
// Check JWT expired:
userSchema.methods.checkJWTExpired = function (tknIat) {
  if (this.passwordChangedAt) {
    const changedT = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return tknIat < changedT;
  }
  return false;
};
// Create Password Reset Token:
userSchema.methods.createPasswordResetToken = function () {
  const resetTkn = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('SHA256')
    .update(resetTkn)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetTkn;
};
const User = mongoose.model('Users', userSchema);
module.exports = User;
