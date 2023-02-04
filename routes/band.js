const express = require('express');
const { body } = require('express-validator/check');

const bandController = require('../controllers/band');

const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.put('/createBand', isAuth, bandController.createBand);

router.patch('/editBand', isAuth, bandController.editBand);

router.patch('/addMember', isAuth, bandController.addMember);

router.patch('/removeMember', isAuth, bandController.removeMember);

router.delete('/deleteBand/:bandId', isAuth, bandController.deleteBand);

module.exports = router;