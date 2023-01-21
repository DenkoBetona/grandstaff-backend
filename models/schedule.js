const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const scheduleSchema = new Schema({
    belongsTo: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    datesTaken: [String]
});

module.exports = mongoose.model('Schedule', scheduleSchema);