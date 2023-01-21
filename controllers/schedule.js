const { validationResult } = require('express-validator/check');

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const Band = require('../models/band');
const User = require('../models/user');
const Schedule = require('../models/schedule');

exports.takeDay = async (req, res, next) => {
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
    const days = req.body.days;
    try {
        const schedule = await Schedule.findOne({belongsTo: req.userId}).exec();
        days.forEach(day => {
            if (!schedule.datesTaken.includes(day)) {
                schedule.datesTaken.push(day);
            }
        });
        await schedule.save();
        res.status(201).json({
            message: "Days set as taken successfully!",
            schedule: schedule
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

exports.freeDay = async (req, res, next) => {
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
    const days = req.body.days;
    try {
        const schedule = await Schedule.findOne({belongsTo: req.userId}).exec();
        days.forEach(day => {
            if (schedule.datesTaken.includes(day)) {
                schedule.datesTaken.splice(schedule.datesTaken.indexOf(day), 1);
            }
        });
        await schedule.save();
        res.status(201).json({
            message: "Dates freed successfully!",
            schedule: schedule
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

exports.getDatesTaken = async (req, res, next) => {
    const userId = req.params.userId;
    try {
        const schedule = await Schedule.findOne({belongsTo: userId}).exec();
        if (!schedule) {
            const error = new Error('Could not find user schedule.');
            error.statusCode = 422;
            throw error;
        }
        res.status(200).json({
            datesTaken: schedule.datesTaken
        });
    } catch(err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}