const express = require('express');
const { body } = require('express-validator/check');

const mediaController = require('../controllers/media');

const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.put('/addMedia', isAuth, mediaController.addMedia);

router.delete('/removeMedia/:fileNameExt', isAuth, mediaController.removeMedia);

router.get('/getMedia', isAuth, mediaController.getMedia);

module.exports = router;