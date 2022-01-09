const express = require('express');
const router = express.Router();

// SignUp:
router.route('/get').post(authController.signup);

module.exports = router;
