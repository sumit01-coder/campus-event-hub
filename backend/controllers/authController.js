const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const emailValidator = require('deep-email-validator');

// Generate JWT
const generateToken = (id, capabilities) => {
    return jwt.sign({ id, capabilities }, process.env.JWT_SECRET || 'fallback_secret', {
        expiresIn: '30d',
    });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !phone || !password) {
            return res.status(400).json({ message: 'Please add all required fields' });
        }
        
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
        
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        // Check if user exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            name,
            email,
            phone,
            password: hashedPassword,
            capabilities: { participant: true, organizer: false }
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                isEmailVerified: user.isEmailVerified,
                capabilities: user.capabilities,
                profile: user.profile,
                organizerProfile: user.organizerProfile,
                paymentConfig: user.paymentConfig,
                token: generateToken(user._id, user.capabilities),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user email
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                isEmailVerified: user.isEmailVerified,
                capabilities: user.capabilities,
                profile: user.profile,
                organizerProfile: user.organizerProfile,
                paymentConfig: user.paymentConfig,
                token: generateToken(user._id, user.capabilities),
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Send Email Verification Token
// @route   POST /api/auth/send-verification
// @access  Private (or public with email, but let's do private)
const sendVerificationEmail = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        if (user.isEmailVerified) {
            return res.status(400).json({ message: 'Email is already verified' });
        }

        const { valid, reason } = await emailValidator.validate({
            email: user.email,
            validateRegex: true,
            validateMx: true,
            validateTypo: true,
            validateDisposable: true,
            validateSMTP: true,
        });

        if (!valid) {
            return res.status(400).json({ message: `Cannot send OTP. This email address appears to be invalid or does not exist. Reason: ${reason}` });
        }

        // Generate a 6-digit token
        const token = Math.floor(100000 + Math.random() * 900000).toString();
        user.emailVerificationToken = token;
        user.emailVerificationExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
        await user.save();

        const sendEmail = require('../utils/sendEmail');
        
        const htmlMessage = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px;">
                <h2 style="color: #4f46e5; text-align: center;">CampusEventHub Verification</h2>
                <p>Hello ${user.name},</p>
                <p>Please use the following 6-digit code to verify your email address:</p>
                <div style="background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 8px; margin: 20px 0;">
                    ${token}
                </div>
                <p>If you did not request this verification, please ignore this email.</p>
                <p>Best regards,<br>The CampusEventHub Team</p>
            </div>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Verify your CampusEventHub Account',
                html: htmlMessage
            });
            res.status(200).json({ message: 'Verification code sent successfully' });
        } catch (error) {
            console.error('Email sending failed:', error);
            // Even if email fails, we don't crash, but we inform the frontend
            res.status(500).json({ message: 'Failed to send email. Please check server logs or use App Passwords.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Verify Email Token
// @route   POST /api/auth/verify-email
// @access  Private
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;
        const user = await User.findById(req.user.id);
        
        if (!user) return res.status(404).json({ message: 'User not found' });
        
        if (user.isEmailVerified) {
            return res.status(400).json({ message: 'Email is already verified' });
        }

        if (user.emailVerificationExpires && user.emailVerificationExpires < Date.now()) {
            return res.status(400).json({ message: 'Verification code has expired. Please request a new one.' });
        }

        if (user.emailVerificationToken !== token) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = undefined; // Clear token
        await user.save();

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            isEmailVerified: user.isEmailVerified,
            capabilities: user.capabilities,
            profile: user.profile,
            organizerProfile: user.organizerProfile,
            paymentConfig: user.paymentConfig,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    registerUser,
    loginUser,
    sendVerificationEmail,
    verifyEmail
};
