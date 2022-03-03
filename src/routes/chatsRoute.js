const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const chatsController = require('../controllers/chatsController');

router.route('/getChats').get(authController.protect, chatsController.getChats);

router
  .route('/getChatHistory')
  .post(authController.protect, chatsController.getChatHistory);

module.exports = router;
