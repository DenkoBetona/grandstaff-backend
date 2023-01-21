const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    type: {
        type: String,
        default: "Enjoyer"
    },
    description: {
        type: String,
        default: "An enjoyer of music"
    },
    city: {
        type: String,
        default: "Undefined"
    },
    country: {
        type: String,
        default: "Bulgaria"
    },
    hscEd: {
        type: String,
        default: "Undefined"
    },
    uniEd: {
        type: String,
        default: "Undefined"
    },
    genres: [String],
    instruments: [String],
    bands: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Band'
        }
    ],
    schedule: {
        type: Schema.Types.ObjectId,
        ref: 'Schedule'
    },
    mediaUrls: [String]
});

module.exports = mongoose.model('User', userSchema);