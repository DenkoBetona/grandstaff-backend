const express = require('express');
const { body } = require('express-validator/check');

const messageController = require('../controllers/message');

const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.put('/sendMessage', isAuth, messageController.sendMessage);

router.get('/getMessagesOf/:userId', isAuth, messageController.getMessagesOf);

module.exports = router;