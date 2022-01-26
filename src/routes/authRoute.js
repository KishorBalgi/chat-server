const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const router = express.Router();
// SignUp:
router.route('/signup').post(authController.signup);
// LogIn:
router.route('/login').post(authController.login);
// Forgot Password:
router.route('/forgotPassword').post(authController.forgotPassword);
// Reset Password:
router.route('/resetPassword/:token').patch(authController.resetPassword);
// Update Password:
router
  .route('/updatePassword')
  .patch(authController.protect, authController.updatePassword);

module.exports = router;
