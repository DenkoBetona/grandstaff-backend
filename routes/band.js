const express = require('express');
const { body } = require('express-validator/check');

const bandController = require('../controllers/band');

const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.put('/createBand', isAuth, bandController.createBand);

module.exports = router;