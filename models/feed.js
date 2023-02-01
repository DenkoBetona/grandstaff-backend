const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const feedSchema = new Schema({
    preference: {
        type: String,
        default: 'Musicians'
    },
    cities: [String],
    belongsTo: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Feed', feedSchema);