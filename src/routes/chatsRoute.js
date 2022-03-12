const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const chatsController = require('../controllers/chatsController');

router.route('/getChats').get(authController.protect, chatsController.getChats);

router
  .route('/getChatHistory')
  .post(authController.protect, chatsController.getChatHistory);

router
  .route('/deleteMessage/:recId/:msgId')
  .delete(authController.protect, chatsController.deleteMessage);

// router
//   .route('/deleteChat')
//   .delete(authController.protect, chatsController.deleteChatFormChatList);
module.exports = router;
