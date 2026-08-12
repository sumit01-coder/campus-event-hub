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
    isPaid: {
        type: Boolean,
        default: false
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
    coordinators: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        email: { type: String, required: true },
        role: { type: String, default: 'volunteer' }
    }],
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
    },
    registeredCount: {
        type: Number,
        default: 0
    },
    announcements: [{
        message: { type: String, required: true },
        date: { type: Date, default: Date.now },
        isHidden: { type: Boolean, default: false }
    }],
    ratings: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, required: true, min: 1, max: 5 },
        review: { type: String },
        date: { type: Date, default: Date.now }
    }],
    isHackathon: {
        type: Boolean,
        default: false
    },
    problemStatements: [{
        title: { type: String, required: true },
        description: { type: String, required: true },
        maxTeams: { type: Number, default: 0 } // 0 = unlimited
    }],
    maxPreferences: {
        type: Number,
        default: 3
    },
    results: {
        isReleased: { type: Boolean, default: false },
        winners: [{
            position: { type: String, required: true }, // e.g., "1st Place", "Runner Up", "Best UI"
            registrationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration' }
        }]
    }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);
