const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    fromId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    toId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    message: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Message', messageSchema);