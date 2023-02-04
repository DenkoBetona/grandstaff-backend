const express = require('express');
const { body } = require('express-validator/check');

const User = require('../models/user');
const authController = require('../controllers/auth');

const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.put(
    '/signup',
    [
        body('email')
          .isEmail()
          .withMessage('Please enter a valid email.')
          .custom((value, { req }) => {
            return User.findOne({ email: value }).then(userDoc => {
              if (userDoc) {
                return Promise.reject('E-Mail address already exists!');
              }
            });
          })
          .normalizeEmail(),
        body('password')
          .trim()
          .isLength({ min: 5 }),
        body('firstName')
          .trim()
          .not()
          .isEmpty(),
        body('lastName')
          .trim()
          .not()
          .isEmpty()
    ],
    authController.signup
);

router.post('/login', authController.login);

router.patch('/define', isAuth, authController.define);

router.get('/findMusician', authController.findMusician);

router.get('/findEmployer', authController.findEmployer);

router.get('/findBand', authController.findBand);

router.get('/getUser/:userId', authController.getUser);

module.exports = router;