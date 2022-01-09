const User = require('../models/user');
const bcrypt = require('bcrypt');
const AuthFeatures = require('../utils/authFeatures');

exports.signup = async (req, res) => {
  try {
    const data = {
      name: req.body.name,
      email: req.body.email,
      createdAt: req.body.createdAt,
      password: await bcrypt.hash(req.body.password, await bcrypt.genSalt(5)),
      img: 'https://i.ibb.co/d5RgxfH/user-blank.png',
    };
    const user = await User.create(data);
    res.status(200).json({
      status: 'success',
      user: { uid: user._id, img: user.img },
      message: 'Account created successfully.',
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const user = new AuthFeatures(User.find(), req.body).find();
    const userArr = await user.users;
    const userData = userArr[0];
    if (!userData) {
      throw 'Invalid E-Mail.';
    }
    await bcrypt.compare(
      req.body.password,
      userData.password,
      (err, isTrue) => {
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
          res.status(400).json({
            status: 'fail',
            message: 'Invalid Password.',
          });
        }
      }
    );
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err,
    });
  }
};
