const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const router = express.Router();
// Delete User:
router
  .route('/deleteMe')
  .delete(authController.protect, userController.deleteMe);
module.exports = router;
