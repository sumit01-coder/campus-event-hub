const User = require('../models/User');
const { spawn } = require('child_process');
const path = require('path');

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
        if (capabilities) {
            user.capabilities = {
                participant: capabilities.participant !== undefined ? capabilities.participant : user.capabilities.participant,
                organizer: capabilities.organizer !== undefined ? capabilities.organizer : user.capabilities.organizer,
            };
        }

        if (profile) {
            user.profile = { ...user.profile, ...profile };
        }

        if (organizerProfile) {
            user.organizerProfile = { ...user.organizerProfile, ...organizerProfile };
            
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
        const { name, phone, college, department, year, studentId, organizationType, organizationName, designation } = req.body;
        
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (name) user.name = name;
        if (phone !== undefined) user.phone = phone;

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
            
            // Set verification status to pending if it's currently none
            if (!user.organizerProfile.verificationStatus || user.organizerProfile.verificationStatus === 'none') {
                user.organizerProfile.verificationStatus = 'pending';
            }
            
            // Set capabilities flag to true so they have the organizer role
            if (!user.capabilities) user.capabilities = {};
            user.capabilities.organizer = true;
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
        
        const pythonProcess = spawn('python', [scriptPath, absoluteImagePath, user.name, expectedCollege, expectedId]);

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
                return res.status(400).json({ message: 'Identity Verification Failed: ID Card does not match profile details.' });
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
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    updateOnboarding,
    updateProfile,
    submitIdentityVerification
};
