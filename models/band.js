const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const bandSchema = new Schema({
    type: {
        type: String,
        default: "Band"
    },
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
    pfpUrl: {
        type: String,
        default: "images/pfp.png"
    },
    imageUrls: [String],
    members: [
        {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
});

module.exports = mongoose.model('Band', bandSchema);