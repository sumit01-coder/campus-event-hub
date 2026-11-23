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
        type: Object,
        default: () => ({
            livePhoto: '',
            idCardPhoto: '',
            status: 'none',
            extractedText: '',
            extractedData: {},
            confidence: 0,
            verifiedAt: null
        })
    },
    
    // Capabilities (replaces legacy static roles)
    capabilities: {
        type: Object,
        default: () => ({
            participant: true,
            organizer: false,
            volunteer: false
        })
    },

    // Basic Profile
    profile: {
        type: Object,
        default: () => ({
            photo: '',
            college: '',
            department: '',
            course: '',
            year: '',
            studentId: ''
        })
    },

    // Organizer Profile
    organizerProfile: {
        type: Object,
        default: () => ({
            organizationName: '',
            organizationType: '',
            designation: '',
            description: '',
            logo: '',
            verificationStatus: 'none'
        })
    },

    // Manual Payment Integration
    paymentConfig: {
        type: Object,
        default: () => ({
            qrCode: '',
            upiId: ''
        })
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
