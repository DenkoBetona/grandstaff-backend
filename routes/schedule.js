const express = require('express');
const { body } = require('express-validator/check');

const scheduleController = require('../controllers/schedule');

const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.patch('/takeDay', isAuth, scheduleController.takeDay);

router.patch('/freeDay', isAuth, scheduleController.freeDay);

router.get('/getDatesTaken/:userId', scheduleController.getDatesTaken);

module.exports = router;