const express = require('express');
const { body } = require('express-validator/check');

const mediaController = require('../controllers/media');

const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.post('/addMedia/:userToken', mediaController.addMedia);

router.delete('/removeMedia/:fileName/:userToken', mediaController.removeMedia);

router.get('/getMedia', isAuth, mediaController.getMedia);

module.exports = router;