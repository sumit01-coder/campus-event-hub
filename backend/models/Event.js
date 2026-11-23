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
    images: [{
        type: String // URLs to event images
    }],
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
    coordinators: {
        type: Array,
        default: []
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
    },
    registeredCount: {
        type: Number,
        default: 0
    },
    announcements: {
        type: Array,
        default: []
    },
    ratings: {
        type: Array,
        default: []
    },
    isHackathon: {
        type: Boolean,
        default: false
    },
    problemStatements: {
        type: Array,
        default: []
    },
    maxPreferences: {
        type: Number,
        default: 3
    },
    results: {
        type: Object,
        default: () => ({ isReleased: false, winners: [] })
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    customQuestions: {
        type: Array,
        default: []
    }
}, { timestamps: true });

// Virtual to populate registrations related to this event
eventSchema.virtual('registrations', {
    ref: 'Registration',
    localField: '_id',
    foreignField: 'eventId'
});

eventSchema.set('toObject', { virtuals: true });
eventSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);
