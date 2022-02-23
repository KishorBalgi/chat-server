const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const router = express.Router();
// SignUp:
router.route('/signup').post(authController.signup);
// LogIn:
router.route('/login').post(authController.login);
// Is loged in:
router.route('/isLoggedIn').get(authController.isLoggedIn);
// Forgot Password:
router.route('/forgotPassword').post(authController.forgotPassword);
// Reset Password:
router.route('/resetPassword/:token').patch(authController.resetPassword);
// Update Password:
router
  .route('/updatePassword')
  .patch(authController.protect, authController.updatePassword);
// Logout:
router.route('/logout').get(authController.logout);

module.exports = router;
