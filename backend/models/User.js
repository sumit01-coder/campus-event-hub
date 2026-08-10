const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // Core Account Info
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    
    // Verification
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationToken: {
        type: String
    },
    emailVerificationExpires: {
        type: Date
    },
    
    // Identity Verification (Live Photo & ID Card)
    identityVerification: {
        livePhoto: { type: String },
        idCardPhoto: { type: String },
        status: { 
            type: String, 
            enum: ['none', 'pending', 'verified', 'rejected'],
            default: 'none'
        },
        extractedText: { type: String },
        extractedData: {
            name: { type: String },
            idNumber: { type: String },
            mobile: { type: String },
            university: { type: String }
        },
        confidence: { type: Number },
        verifiedAt: { type: Date }
    },
    
    // Capabilities (replaces legacy static roles)
    capabilities: {
        participant: { type: Boolean, default: true },
        organizer: { type: Boolean, default: false },
        volunteer: { type: Boolean, default: false }
    },

    // Basic Profile
    profile: {
        photo: { type: String },
        college: { type: String },
        department: { type: String },
        course: { type: String },
        year: { type: String },
        studentId: { type: String }
    },

    // Organizer Profile
    organizerProfile: {
        organizationName: { type: String },
        organizationType: { type: String },
        designation: { type: String },
        description: { type: String },
        logo: { type: String },
        verificationStatus: { 
            type: String, 
            enum: ['none', 'pending', 'verified', 'rejected'],
            default: 'none'
        }
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
