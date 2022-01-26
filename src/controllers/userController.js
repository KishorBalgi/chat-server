const User = require('../models/user');
const AppError = require('../utils/appErrors');
const catchAsync = require('../utils/catchAsync');
// Data filerer:
const filterObj = (obj, filters) => {
  const fltrObj = {};
  Object.keys(obj).forEach((e) => {
    if (filters.includes(e)) {
      fltrObj[e] = obj[e];
    }
  });
};
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
