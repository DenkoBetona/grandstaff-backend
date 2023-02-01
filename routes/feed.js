const express = require('express');
const { body } = require('express-validator/check');

const feedController = require('../controllers/feed');

const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.patch('/setPref', isAuth, feedController.setPref);

router.get('/getFeed', isAuth, feedController.getFeed);

router.get('/serveNext', isAuth, feedController.serveNext);

module.exports = router;