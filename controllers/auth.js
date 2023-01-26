const { validationResult } = require('express-validator/check');

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Schedule = require('../models/schedule');

exports.signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const email = req.body.email;
    const password = req.body.password;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    try {
        const hashedPw = await bcrypt.hash(password, 12);

        const user = new User({
            email: email,
            password: hashedPw,
            firstName: firstName,
            lastName: lastName,
        });
        const sched = new Schedule({
            belongsTo: user._id,
            datesTaken: []
        })
        await sched.save();
        user.schedule = sched._id;
        const result = await user.save();
        res.status(201).json({
            message: 'User created!', 
            userId: result._id,
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.login = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    try {
        const user = await User.findOne({ email: email }).exec();
        if (!user) {
            const error = new Error('A user with this email could not be found.');
            error.statusCode = 401;
            throw error;
        }
        loadedUser = user;
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            const error = new Error('Wrong password!');
            error.statusCode = 401;
            throw error;
        }
        const token = jwt.sign(
            {
                email: loadedUser.email,
                userId: loadedUser._id.toString()
            },
            'bettercallsaulgoodman',
            { expiresIn: '1h' }
        );
        res.status(200).json({ token: token, userId: loadedUser._id.toString() });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.define = async (req, res, next) => {
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
    const type = req.body.type;
    const description = req.body.description;
    const city = req.body.city;
    const hscEd = req.body.hscEd;
    const uniEd = req.body.uniEd;
    const genres = req.body.genres;
    const instruments = req.body.instruments;
    let paths = [];
    if (req.files) paths = req.files.map(file => file.path.replace("\\" ,"/"));
    try{
        const user = await User.findById(req.userId);
        user.type = type;
        user.description = description;
        user.city = city;
        user.hscEd = hscEd;
        user.uniEd = uniEd;
        user.genres = genres;
        user.instruments = instruments;
        paths.forEach(path => {
            user.mediaUrls.push(path);
        });
        await user.save();
        res.status(201).json({
            message: "User defined successfully!",
            user: user
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }

}

exports.find = async (req, res, next) => {
    const region = req.query.region;
    const instrument = req.query.instrument;
    try {
        let users = await User.find();
        let passQuery;
        let queryUsers = [];
        users.forEach(user => {
            console.log(user);
            passQuery = true;
            if (region) {
                if (Array.isArray(region)) {
                    if (!region.includes(user.city)) {
                        console.log('failed region is array query');
                        passQuery = false;
                    }
                }
                if (!Array.isArray(region)) {
                    if (user.city !== region) {
                        console.log('failed region is not array query');
                        passQuery = false;
                    }
                }
            }
            if (instrument) {
                if (!Array.isArray(instrument)) {
                    if (!user.instruments.includes(instrument)) {
                        console.log('failed instrument is not array query');
                        passQuery = false;
                    }
                }
                if (Array.isArray(instrument)) {
                    let commonElement = false;
                    instrument.forEach(inst => {
                        user.instruments.forEach(uInst => {
                            console.log(inst);
                            console.log(uInst);
                            if (uInst === inst) commonElement = true;
                        });
                    });
                    if (!commonElement) {
                        console.log('failed instrument is array query');
                        passQuery = false;
                    }
                }
            }
            if (passQuery) queryUsers.push(user);
        });
        res.status(201).json({
            region: region,
            instrument: instrument,
            queryUsers: queryUsers
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}