const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    venue: {
        type: String,
        required: true
    },
    image: {
        type: String, // URL to event image
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['technology', 'music', 'workshop', 'business', 'sports', 'arts', 'other']
    },
    price: {
        type: Number,
        default: 0 // 0 means Free
    },
    capacity: {
        type: Number,
        required: true
    },
    organizerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    registrationDeadline: {
        type: Date,
        required: false
    },
    participationType: {
        type: String,
        enum: ['individual', 'group', 'both'],
        default: 'individual'
    },
    maxGroupSize: {
        type: Number,
        default: 1
    }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
