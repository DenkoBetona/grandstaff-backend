const { validationResult } = require('express-validator/check');

const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const User = require('../models/user');
const Schedule = require('../models/schedule');
const Feed = require('../models/feed');
const Band = require('../models/band');

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
};

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
        });
        const feed = new Feed({
            preference: 'Musician',
            belongsTo: user._id
        });
        await sched.save();
        await feed.save();
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
    const desc = req.body.desc;
    const city = req.body.city;
    const hscEd = req.body.hscEd;
    const uniEd = req.body.uniEd;
    const genres = req.body.genres;
    const instruments = req.body.instruments;
    let paths = [];
    if (req.files) paths = req.files.map(file => file.path.replace("\\" ,"/"));
    try {
        const user = await User.findById(req.userId);
        if (type) user.type = type;
        if (desc) user.desc = desc;
        if (city) user.city = city;
        if (hscEd) user.hscEd = hscEd;
        if (uniEd) user.uniEd = uniEd;
        if (genres) user.genres = genres;
        if (instruments) user.instruments = instruments;
        user.mediaUrls.forEach(mediaUrl => {
            clearImage(mediaUrl);
        });
        clearImage(user.pfpUrl);
        paths.forEach(path => {
            if (!path.includes('pfp'))
                user.mediaUrls.push(path);
            else user.pfpUrl = path;
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

// Fisher-Yates Algorithm
const shuffleArray = array => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
}

exports.findMusician = async (req, res, next) => {
    let name = req.query.name;
    const region = req.query.region;
    const instrument = req.query.instrument;
    const genre = req.query.genre;
    const uEdu = req.query.uEdu;
    try {
        if (name) {
            if (name.includes(' ')) {
                name = name.split(' ');
            }
        }
        let users = await User.find();
        let passQuery;
        let queryUsers = [];
        users.forEach(user => {
            //console.log(user);
            passQuery = true;
            if (user.type !== 'Musician') passQuery = false;
            if (name) {
                if (Array.isArray(name)) {
                    let tempPass = false;
                    name.forEach(n => {
                        if (user.firstName.toLowerCase().includes(n.toLowerCase()) 
                                || user.lastName.toLowerCase().includes(n.toLowerCase()))
                            tempPass = true;
                    });
                    if (!tempPass) passQuery = false;
                }
                else {
                    if (!user.firstName.toLowerCase().includes(name.toLowerCase()) 
                            && !user.lastName.toLowerCase().includes(name.toLowerCase())) 
                        passQuery = false;
                }
            }
            if (region) {
                if (Array.isArray(region)) {
                    if (!region.includes(user.city)) {
                        console.log('failed region is array query');
                        passQuery = false;
                    }
                }
                else {
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
                else {
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
            if (genre) {
                if (!Array.isArray(genre)) {
                    if (!user.genres.includes(genre)) {
                        console.log('failed genre is not array query');
                        passQuery = false;
                    }
                }
                else {
                    let commonElement = false;
                    genre.forEach(inst => {
                        user.genres.forEach(uInst => {
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
            if (uEdu === 'true') {
                if (user.uniEd === 'Undefined') passQuery = false;
            }
            if (passQuery) {
                user.pfpUrl = 'http://localhost:8080/' + user.pfpUrl;
                queryUsers.push(user);
            }
        });
        let uniEdUsers = [];
        let noUniEdUsers = [];
        queryUsers.forEach(user => {
            if (user.uniEd === 'Undefined') noUniEdUsers.push(user);
            else uniEdUsers.push(user);
        });
        queryUsers = [];
        console.log(uniEdUsers);
        shuffleArray(uniEdUsers);
        shuffleArray(noUniEdUsers);
        uniEdUsers.forEach(user => {
            queryUsers.push(user);
        });
        noUniEdUsers.forEach(user => {
            queryUsers.push(user);
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

exports.findEmployer = async (req, res, next) => {
    let name = req.query.name;
    const region = req.query.region;
    const instrument = req.query.instrument;
    const genre = req.query.genre;
    const uEdu = req.query.uEdu;
    try {
        if (name) {
            if (name.includes(' ')) {
                name = name.split(' ');
            }
        }
        let users = await User.find();
        let passQuery;
        let queryUsers = [];
        users.forEach(user => {
            //console.log(user);
            passQuery = true;
            if (user.type !== 'Employer') passQuery = false;
            if (name) {
                if (Array.isArray(name)) {
                    let tempPass = false;
                    name.forEach(n => {
                        if (user.firstName.toLowerCase().includes(n.toLowerCase()) 
                                || user.lastName.toLowerCase().includes(n.toLowerCase()))
                            tempPass = true;
                    });
                    if (!tempPass) passQuery = false;
                }
                else {
                    if (!user.firstName.toLowerCase().includes(name.toLowerCase()) 
                            && !user.lastName.toLowerCase().includes(name.toLowerCase())) 
                        passQuery = false;
                }
            }
            if (region) {
                if (Array.isArray(region)) {
                    if (!region.includes(user.city)) {
                        console.log('failed region is array query');
                        passQuery = false;
                    }
                }
                else {
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
                else {
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
            if (genre) {
                if (!Array.isArray(genre)) {
                    if (!user.genres.includes(genre)) {
                        console.log('failed genre is not array query');
                        passQuery = false;
                    }
                }
                else {
                    let commonElement = false;
                    genre.forEach(inst => {
                        user.genres.forEach(uInst => {
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
            if (uEdu === 'true') {
                if (user.uniEd === 'Undefined') passQuery = false;
            }
            if (passQuery) { 
                user.pfpUrl = 'http://localhost:8080/' + user.pfpUrl;
                queryUsers.push(user); 
            }
        });
        let uniEdUsers = [];
        let noUniEdUsers = [];
        queryUsers.forEach(user => {
            if (user.uniEd === 'Undefined') noUniEdUsers.push(user);
            else uniEdUsers.push(user);
        });
        queryUsers = [];
        console.log(uniEdUsers);
        shuffleArray(uniEdUsers);
        shuffleArray(noUniEdUsers);
        uniEdUsers.forEach(user => {
            queryUsers.push(user);
        });
        noUniEdUsers.forEach(user => {
            queryUsers.push(user);
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

exports.findBand = async (req, res, next) => {
    let name = req.query.name;
    const region = req.query.region;
    const genre = req.query.genre;
    try {
        if (name) {
            if (name.includes(' ')) {
                name = name.split(' ');
            }
        }
        let bands = await Band.find();
        let passQuery;
        let queryBands = [];
        bands.forEach(band => {
            //console.log(band);
            passQuery = true;
            if (name) {
                if (Array.isArray(name)) {
                    let tempPass = false;
                    name.forEach(n => {
                        if (band.name.toLowerCase().includes(n.toLowerCase()))
                            tempPass = true;
                    });
                    if (!tempPass) passQuery = false;
                }
                else {
                    if (!band.name.toLowerCase().includes(name.toLowerCase())) 
                        passQuery = false;
                }
            }
            if (region) {
                if (Array.isArray(region)) {
                    if (!region.includes(band.city)) {
                        console.log('failed region is array query');
                        passQuery = false;
                    }
                }
                else {
                    if (band.city !== region) {
                        console.log('failed region is not array query');
                        passQuery = false;
                    }
                }
            }
            if (genre) {
                if (!Array.isArray(genre)) {
                    if (!band.genres.includes(genre)) {
                        console.log('failed genre is not array query');
                        passQuery = false;
                    }
                }
                else {
                    let commonElement = false;
                    genre.forEach(inst => {
                        band.genres.forEach(uInst => {
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
            if (passQuery) { 
                band.pfpUrl = 'http://localhost:8080/' + band.pfpUrl;
                queryBands.push(band);
            }
        });
        shuffleArray(queryBands);
        res.status(201).json({
            region: region,
            queryBands: queryBands
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            const error = new Error('User not found.');
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({
            user: user
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}