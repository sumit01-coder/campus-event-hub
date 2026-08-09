const mongoose = require('mongoose');

const querySchema = new mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    user: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        name: {
            type: String,
            required: true
        }
    },
    text: {
        type: String,
        required: true,
        trim: true
    },
    isResolved: {
        type: Boolean,
        default: false
    },
    replies: [{
        sender: {
            type: String,
            enum: ['attendee', 'organizer'],
            required: true
        },
        text: {
            type: String,
            required: true,
            trim: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Query', querySchema);
