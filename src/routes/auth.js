const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

// SignUp:
router.route('/signup').post(authController.signup);

// LogIn:
router.route('/login').post(authController.login);
module.exports = router;
