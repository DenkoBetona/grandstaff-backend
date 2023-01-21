const { validationResult } = require('express-validator/check');

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const Band = require('../models/band');
const User = require('../models/user');

const path = require('path');
const fs = require('fs');

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
    const paths = req.files.map(file => file.path.replace("\\" ,"/"));
    try {
        const user = await User.findById(req.userId);
        paths.forEach(path => {
            user.mediaUrls.push(path);
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
    const path = "images/" + req.params.fileNameExt;
    try {
        const user = await User.findById(req.userId);
        if (user.mediaUrls.includes(path)){
            user.mediaUrls.splice(user.mediaUrls.indexOf(path), 1);
        }
        await user.save();
        clearImage(path);
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

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
};