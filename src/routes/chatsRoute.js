const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const chatsController = require('../controllers/chatsController');

router.route('/getChats').get(authController.protect, chatsController.getChats);

module.exports = router;
