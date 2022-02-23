const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const router = express.Router();
// Delete Me:
router
  .route('/deleteMe')
  .delete(authController.protect, userController.deleteMe);

// Update Me:
router
  .route('/updateMe')
  .patch(authController.protect, userController.updateMe);

module.exports = router;
