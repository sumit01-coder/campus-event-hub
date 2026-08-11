const User = require('../models/User');
const { spawn } = require('child_process');
const path = require('path');
const emailValidator = require('deep-email-validator');

// @desc    Update user onboarding and profile data
// @route   POST /api/users/onboarding
// @access  Private
const updateOnboarding = async (req, res) => {
    try {
        const { capabilities, profile, organizerProfile } = req.body;
        
        // Find user by ID from the JWT token (req.user)
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields if provided
        // Ensure users cannot arbitrarily set themselves as organizers without verification
        if (capabilities && capabilities.participant !== undefined) {
            if (!user.capabilities) user.capabilities = {};
            user.capabilities.participant = capabilities.participant;
            // Deliberately ignoring capabilities.organizer here to prevent escalation
        }

        if (profile) {
            user.profile = { ...user.profile, ...profile };
        }

        if (organizerProfile) {
            // Strip out any verificationStatus sent by the client
            const { verificationStatus, ...safeOrganizerProfile } = organizerProfile;
            user.organizerProfile = { ...user.organizerProfile, ...safeOrganizerProfile };
            
            // If they are setting up an organizer profile, mark verification as pending
            if (!user.organizerProfile.verificationStatus || user.organizerProfile.verificationStatus === 'none') {
                user.organizerProfile.verificationStatus = 'pending';
            }
        }

        const updatedUser = await user.save();

        // Return updated user data (matching auth response format)
        res.json({
            _id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            capabilities: updatedUser.capabilities,
            profile: updatedUser.profile,
            organizerProfile: updatedUser.organizerProfile,
            paymentConfig: updatedUser.paymentConfig,
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update user basic profile details
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const { name, email, phone, college, department, year, studentId, organizationType, organizationName, designation, paymentConfig } = req.body;
        
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (name) user.name = name;
        if (phone !== undefined) user.phone = phone;

        if (email && email !== user.email) {
            const { valid, reason } = await emailValidator.validate({
                email: email,
                validateRegex: true,
                validateMx: true,
                validateTypo: true,
                validateDisposable: true,
                validateSMTP: true,
            });

            if (!valid) {
                return res.status(400).json({ message: `Invalid email address. Reason: ${reason}` });
            }

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ message: 'Email is already in use by another account' });
            }
            user.email = email;
            user.isEmailVerified = false;
        }

        // Ensure profile object exists
        if (!user.profile) {
            user.profile = {};
        }

        if (college !== undefined) user.profile.college = college;
        if (department !== undefined) user.profile.department = department;
        if (year !== undefined) user.profile.year = year;
        if (studentId !== undefined) user.profile.studentId = studentId;

        // Handle Organizer Application
        if (organizationType) {
            if (!user.organizerProfile) {
                user.organizerProfile = {};
            }
            user.organizerProfile.organizationType = organizationType;
            if (organizationName) user.organizerProfile.organizationName = organizationName;
            if (designation) user.organizerProfile.designation = designation;
            
            // Set verification status to pending if it's currently none or rejected
            if (!user.organizerProfile.verificationStatus || ['none', 'rejected'].includes(user.organizerProfile.verificationStatus)) {
                user.organizerProfile.verificationStatus = 'pending';
            }
            
            // Ensure capability reflects verified status. Wait for admin approval to become fully capable.
            if (!user.capabilities) user.capabilities = {};
            if (user.organizerProfile.verificationStatus === 'verified') {
                user.capabilities.organizer = true;
            } else {
                user.capabilities.organizer = false;
            }
        }

        // Handle Payment Config
        if (paymentConfig) {
            if (!user.paymentConfig) {
                user.paymentConfig = {};
            }
            if (paymentConfig.qrCode !== undefined) user.paymentConfig.qrCode = paymentConfig.qrCode;
            if (paymentConfig.upiId !== undefined) user.paymentConfig.upiId = paymentConfig.upiId;
        }

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            isEmailVerified: updatedUser.isEmailVerified,
            capabilities: updatedUser.capabilities,
            profile: updatedUser.profile,
            organizerProfile: updatedUser.organizerProfile,
            paymentConfig: updatedUser.paymentConfig,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Submit Identity Verification (Live Photo & ID Card)
// @route   POST /api/users/verify-identity
// @access  Private
const submitIdentityVerification = async (req, res) => {
    try {
        const { livePhotoUrl, idCardPhotoUrl } = req.body;
        
        if (!livePhotoUrl || !idCardPhotoUrl) {
            return res.status(400).json({ message: 'Both live photo and ID card are required' });
        }
        
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // --- Python OCR Integration ---
        // We will call the Python script to extract and verify the ID card
        const scriptPath = path.join(__dirname, '../services/ocr_service.py');
        // Convert the relative URL (e.g. /uploads/...) to an absolute file system path
        const absoluteImagePath = path.join(__dirname, '..', idCardPhotoUrl);
        
        const expectedCollege = user.profile?.college || '';
        const expectedId = user.profile?.studentId || '';
        const expectedMobile = user.phone || '';
        
        const absoluteLivePhotoPath = path.join(__dirname, '..', livePhotoUrl);
        
        const pythonProcess = spawn('python', [scriptPath, absoluteImagePath, absoluteLivePhotoPath, user.name, expectedCollege, expectedId, expectedMobile]);

        let pythonOutput = '';
        
        // Wrap the child process in a promise so we can await it
        await new Promise((resolve, reject) => {
            pythonProcess.stdout.on('data', (data) => {
                pythonOutput += data.toString();
            });
            
            pythonProcess.stderr.on('data', (data) => {
                console.error(`Python OCR Error: ${data}`);
            });
            
            pythonProcess.on('close', (code) => {
                resolve();
            });
        });

        // Parse the Python JSON output
        let extractedText = '';
        let extractedData = {};
        let confidenceScore = 0;
        try {
            const ocrResult = JSON.parse(pythonOutput);
            if (!ocrResult.match) {
                const errorMsg = ocrResult.error || 'Identity Verification Failed: Details do not match.';
                return res.status(400).json({ message: errorMsg });
            }
            extractedText = ocrResult.extracted_text || 'Name matched successfully.';
            extractedData = ocrResult.extracted_data || {};
            confidenceScore = ocrResult.confidence || 0;
        } catch (err) {
            console.error('Failed to parse Python output:', pythonOutput);
            return res.status(500).json({ message: 'OCR Service Error' });
        }
        // --- End Python OCR Integration ---

        user.identityVerification = {
            livePhoto: livePhotoUrl,
            idCardPhoto: idCardPhotoUrl,
            status: 'verified', // Verified by Python OCR
            extractedText: extractedText,
            extractedData: extractedData,
            confidence: confidenceScore,
            verifiedAt: new Date()
        };
        
        // Use the live captured photo as the user's profile avatar
        if (!user.profile) user.profile = {};
        user.profile.photo = livePhotoUrl;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            phone: updatedUser.phone,
            isEmailVerified: updatedUser.isEmailVerified,
            identityVerification: updatedUser.identityVerification,
            capabilities: updatedUser.capabilities,
            profile: updatedUser.profile,
            organizerProfile: updatedUser.organizerProfile,
            paymentConfig: updatedUser.paymentConfig,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const bcrypt = require('bcryptjs');

// @desc    Delete user account completely
// @route   DELETE /api/users/profile
// @access  Private
const deleteAccount = async (req, res) => {
    try {
        const { password } = req.body;
        
        if (!password) {
            return res.status(400).json({ message: 'Password is required to delete account' });
        }

        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        // Delete associated records to completely wipe the user
        const Event = require('../models/Event');
        await Event.deleteMany({ organizerId: user._id });
        
        const Registration = require('../models/Registration');
        await Registration.deleteMany({ userId: user._id });

        await user.deleteOne();

        res.json({ message: 'Account completely deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    updateOnboarding,
    updateProfile,
    submitIdentityVerification,
    deleteAccount
};
