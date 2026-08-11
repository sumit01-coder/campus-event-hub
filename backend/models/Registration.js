const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    participantName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    college: {
        type: String
    },
    participationType: {
        type: String,
        enum: ['individual', 'group'],
        default: 'individual'
    },
    teamCode: {
        type: String,
        sparse: true // sparse allows nulls but keeps it unique when present
    },
    isTeamLeader: {
        type: Boolean,
        default: false
    },
    teamSize: {
        type: Number,
        default: 1
    },
    joinedTeamCode: {
        type: String // if they joined someone else's team
    },
    status: {
        type: String,
        enum: ['registered', 'cancelled', 'attended'],
        default: 'registered'
    },
    paymentStatus: {
        type: String,
        enum: ['free', 'pending_verification', 'verified', 'rejected', 'paid', 'pending'],
        default: 'free'
    },
    paymentProof: {
        type: String // URL to the uploaded screenshot
    },
    cancellationRequested: {
        type: Boolean,
        default: false
    },
    // Hackathon Specific Fields
    preferences: [{
        type: mongoose.Schema.Types.ObjectId // References a problem statement _id within the Event
    }],
    assignedProblemId: {
        type: mongoose.Schema.Types.ObjectId
    },
    projectSubmission: {
        githubLink: { type: String },
        liveDemoLink: { type: String },
        presentationLink: { type: String },
        submittedAt: { type: Date }
    }
}, { timestamps: true });

// Prevent duplicate registrations for the same event
registrationSchema.index({ userId: 1, eventId: 1 }, { unique: true });

module.exports = mongoose.model('Registration', registrationSchema);
