const { validationResult } = require('express-validator/check');

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const Band = require('../models/band');
const User = require('../models/user');

exports.createBand = async (req, res, next) => {
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
    const name = req.body.name;
    const city = req.body.city;
    const genres = req.body.genres;
    const band = new Band({
        name: name,
        city: city,
        genres: genres
    });
    let paths = [];
    if (req.files) paths = req.files.map(file => file.path.replace("\\" ,"/"));
    try {
        paths.forEach(path => {
            if (!path.includes('pfp'))
                band.mediaUrls.push(path);
            else band.pfpUrl = path;
        });
        band.members.push(req.userId);
        await band.save();
        const user = await User.findById(req.userId);
        user.bands.push(band._id);
        await user.save();
        res.status(201).json({
            message: 'Band created successfully!',
            band: band,
            creator: band.members[0]
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

exports.addMember = async (req, res, next) => {
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
    const bandId = req.body.bandId;
    const userId = req.body.userId;
    const meId = req.userId;
    try {
        const user = await User.findById(userId);
        const band = await Band.findById(bandId);
        if (band.members.includes(meId)) {
            band.members.push(userId);
            user.bands.push(bandId);
            await user.save();
            await band.save();
            res.status(201).json({
                message: 'Member added successfully!',
                member: user,
                band: band
            });
        }
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}