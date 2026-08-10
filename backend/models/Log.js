const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    level: {
        type: String,
        enum: ['info', 'warning', 'error'],
        default: 'info'
    },
    message: {
        type: String,
        required: true
    },
    context: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    url: {
        type: String
    },
    details: {
        type: mongoose.Schema.Types.Mixed
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create a TTL index to delete logs older than 30 days automatically
logSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

const Log = mongoose.model('Log', logSchema);
module.exports = Log;
