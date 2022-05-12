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

router
  .route('/uploadFile')
  .post(
    authController.protect,
    chatsController.upload.single('file'),
    chatsController.uploadFile
  );

router
  .route('/file/:filename')
  .get(authController.protect, chatsController.getFile);
// router
//   .route('/deleteChat')
//   .delete(authController.protect, chatsController.deleteChatFormChatList);

module.exports = router;
