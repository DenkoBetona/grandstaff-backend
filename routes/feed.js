const express = require('express');
const { body } = require('express-validator/check');

const feedController = require('../controllers/feed');

const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.patch('/setPref', feedController.setPref);

router.get('/getFeed', feedController.getFeed);

router.get('/serveNext', feedController.serveNext);

module.exports = router;