const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

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

        // Generate a 6-digit token
        const token = Math.floor(100000 + Math.random() * 900000).toString();
        user.emailVerificationToken = token;
        await user.save();

        // In a real app, send email here. For now, return token to frontend.
        res.json({ message: 'Verification code sent', token });
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
