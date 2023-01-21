const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bandSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    country: {
        type: String,
        default: "Bulgaria"
    },
    genres: [String],
    members: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
});

module.exports = mongoose.model('Band', bandSchema);