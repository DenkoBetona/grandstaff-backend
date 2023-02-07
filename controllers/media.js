const { validationResult } = require('express-validator/check');

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const ffmpeg = require('fluent-ffmpeg')
ffmpeg.setFfmpegPath(ffmpegPath);

const Band = require('../models/band');
const User = require('../models/user');

const path = require('path');
const fs = require('fs');

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
};

exports.addMedia = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }
    if (!req.files) {
        const error = new Error('No image provided.');
        error.statusCode = 422;
        throw error;
    }

    const token = req.params.userToken;
    let userId = 0;
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, 'bettercallsaulgoodman');
    } catch (err) {
      err.statusCode = 500;
      next(err);
    }
    if (!decodedToken) {
      const error = new Error('Not authenticated.');
      error.statusCode = 401;
      next(error);
    }
    else {
      userId = decodedToken.userId;
    }
    
    const paths = req.files.map(file => file.path.replace("\\" ,"/"));
    try {
        const user = await User.findById(userId);
        paths.forEach(path => {
            if (!path.includes('pfp')) {
                user.mediaUrls.push(path);
                if (path.includes('.mp4')) {
                    ffmpeg(path)
                    .seekInput('00:01')
                    .frames(1)
                    .output(path.substring(0, path.indexOf('.')) + '.png')
                    .run();
                }
            }
            else {
                if (user.pfpUrl.includes('-')) {
                    clearImage(user.pfpUrl);
                }
                user.pfpUrl = path;
            }
        });
        await user.save();
        res.status(201).json({
            message: "Files added to user successfully!",
            user: user
        });
    } catch (err) {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
    }
}

exports.removeMedia = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }
    const path = "images/" + req.params.fileName;

    const token = req.params.userToken;
    let userId = 0;
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, 'bettercallsaulgoodman');
    } catch (err) {
      err.statusCode = 500;
      next(err);
    }
    if (!decodedToken) {
      const error = new Error('Not authenticated.');
      error.statusCode = 401;
      next(error);
    }
    else {
      userId = decodedToken.userId;
    }

    try {
        const user = await User.findById(userId);
        path.concat('.mp4')
        if (user.mediaUrls.includes(path)){
            user.mediaUrls.splice(user.mediaUrls.indexOf(path), 1);
        }
        path.concat('.png')
        if (user.mediaUrls.includes(path)){
            user.mediaUrls.splice(user.mediaUrls.indexOf(path), 1);
        }
        path.concat('.jpg')
        if (user.mediaUrls.includes(path)){
            user.mediaUrls.splice(user.mediaUrls.indexOf(path), 1);
        }
        path.concat('.jpeg')
        if (user.mediaUrls.includes(path)){
            user.mediaUrls.splice(user.mediaUrls.indexOf(path), 1);
        }
        await user.save();
        clearImage(path);
        clearImage(path.substring(0, path.indexOf('.')) + '.png');
        clearImage(path.substring(0, path.indexOf('.')) + '.jpg');
        clearImage(path.substring(0, path.indexOf('.')) + '.jpeg');
        res.status(201).json({
            message: "File removed from user successfully!",
            user: user
        });
    } catch (err) {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
    }
}

exports.getMedia = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        res.status(200).json({
            mediaUrls: user.mediaUrls
        });
    } catch (err) {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
    }
}