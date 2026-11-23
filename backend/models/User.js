const mongoose = require('mongoose');

const identityVerificationSchema = new mongoose.Schema({
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
}, { _id: false });

const capabilitiesSchema = new mongoose.Schema({
    participant: { type: Boolean, default: true },
    organizer: { type: Boolean, default: false },
    volunteer: { type: Boolean, default: false }
}, { _id: false });

const profileSchema = new mongoose.Schema({
    photo: { type: String },
    college: { type: String },
    department: { type: String },
    course: { type: String },
    year: { type: String },
    studentId: { type: String }
}, { _id: false });

const organizerProfileSchema = new mongoose.Schema({
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
}, { _id: false });

const paymentConfigSchema = new mongoose.Schema({
    qrCode: { type: String }, // URL to uploaded QR code image
    upiId: { type: String }
}, { _id: false });

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
        type: identityVerificationSchema,
        default: () => ({})
    },
    
    // Capabilities (replaces legacy static roles)
    capabilities: {
        type: capabilitiesSchema,
        default: () => ({ participant: true, organizer: false, volunteer: false })
    },

    // Basic Profile
    profile: {
        type: profileSchema,
        default: () => ({})
    },

    // Organizer Profile
    organizerProfile: {
        type: organizerProfileSchema,
        default: () => ({})
    },

    // Manual Payment Integration
    paymentConfig: {
        type: paymentConfigSchema,
        default: () => ({})
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
