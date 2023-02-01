const { validationResult } = require('express-validator/check');

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Feed = require('../models/feed');

exports.setPref = async (req, res, next) => {
    const pref = req.body.pref;
    const cities = req.body.cities;
    try {
        let feed = await Feed.findOne({belongsTo: req.userId});
        if (!feed) {
            feed = new Feed({
                preference: "Musicians",
                cities: [],
                belongsTo: req.userId
            });
            await feed.save();
        }
        if (req.userId !== '0') {
            feed.preference = pref;
            await feed.save();
            res.status(201).json({
                message: "Feed preference set successfully!",
                feed: feed
            });
        }
        
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

exports.getFeed = async (req, res, next) => {
    try {
        const feed = await Feed.findOne({belongsTo: req.userId});
        if (!feed) {
            feed = new Feed({
                preference: "Musicians",
                belongsTo: req.userId
            });
            await feed.save();
        }
        res.status(200).json({
            message: "Get Preference done successfully!",
            preference: feed
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

// Fisher-Yates Algorithm
const shuffleArray = array => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
}

exports.serveNext = async (req, res, next) => {
    let queryUsers = [];
    try {
        const users = await User.find();
        let passQuery;
        let queryUsers = [];
        let me, feed;
        if (req.userId !== '0') {
            me = await User.findById(req.userId);
            feed = await Feed.find({belongsTo: req.userId});
        }
        users.forEach(async user => {
            if (user.type === 'Undefined' || user.type === 'Enjoyer') return;
            if (me.type === 'Enjoyer' || user.type === 'Employer') passQuery = false;
            passQuery = true;
            if (req.userId === '0') {
                if (user.type === 'Employer') passQuery = false;
            }
            if (req.userId !== '0') {
                let tempPass = false;
                user.genres.forEach(genre => {
                    if (me.genres.includes(genre)) tempPass = true;
                });
                if (!tempPass) passQuery = false;
                if (feed.preference === 'Musicians' && user.type === 'Employer') passQuery = false;
                if (feed.preference === 'Employers') {
                    tempPass = false;
                    me.instruments.forEach(instrument => {
                        if (user.instruments.includes(instrument)) tempPass = true;
                    });
                    if (!tempPass) passQuery = false;
                    if (user.uniEd !== 'Undefined' && me.uniEd === 'Undefined') queryPass = false;
                }
                if (feed.cities && !feed.cities.contains(user.city)) queryPass = false;
            }
            if (passQuery) queryUsers.push(user);
        });
        let uniEdUsers = [];
        let noUniEdUsers = [];
        queryUsers.forEach(user => {
            if (user.type === 'Musician') {
                if (user.uniEd === 'Undefined') noUniEdUsers.push(user);
                else uniEdUsers.push(user);
            }
            else uniEdUsers.push(user);
        });
        queryUsers = [];
        shuffleArray(uniEdUsers);
        shuffleArray(noUniEdUsers);
        uniEdUsers.forEach(user => {
            queryUsers.push(user);
        });
        noUniEdUsers.forEach(user => {
            queryUsers.push(user);
        });
        res.status(200).json({
            message: "Users retrieved successfully!",
            users: queryUsers
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

