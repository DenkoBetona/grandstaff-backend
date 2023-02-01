const { validationResult } = require('express-validator/check');

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Message = require('../models/message');

const path = require('path');
const fs = require('fs');
const user = require('../models/user');

exports.sendMessage = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        res.json({
            error: error
        });
        throw error;
    }
    const fromId = req.userId;
    const toId = req.body.toId;
    const msgTxt = req.body.message;
    const message = new Message({
        fromId: fromId,
        toId: toId,
        message: msgTxt
    });
    try {
        await message.save();
        const user1 = await User.findById(fromId);
        const user2 = await User.findById(toId);
        user1.messages.push(message._id);
        user2.messages.push(message._id);
        await user1.save();
        await user2.save();
        res.status(201).json({
            message: "Message sent successfully!",
            msg: message
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            res.status(500).json({
                error: err
            });
        }
        next(err);
    }
}

exports.getMessagesOf = async (req, res, next) => {
    const userMe = req.userId;
    const userYou = req.params.userId;
    try {
        const messages = [];
        messages.push(await Message.find({fromId: userMe, toId: userYou}));
        messages.push(await Message.find({fromId: userYou, toId: userMe}));
        res.status(200).json({
            messages: messages
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
            res.status(500).json({
                error: err
            });
        }
        next(err);
    }
}