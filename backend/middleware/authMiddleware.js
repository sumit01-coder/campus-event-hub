const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token (exclude password)
            req.user = await User.findById(decoded.id).select('-password');

            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Middleware to optionally attach user if token exists, without rejecting unauthenticated requests
const optionalAuth = async (req, res, next) => {
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
        } catch (error) {
            req.user = null;
        }
    }
    next();
};

// Middleware to restrict access to Organizers and Admins
const requireOrganizer = (req, res, next) => {
    // If it's a super admin, allow them to bypass
    if (req.user && req.user.role === 'super_admin') {
        return next();
    }

    // Check if user has organizer capability AND is explicitly verified
    if (
        req.user && 
        req.user.capabilities?.organizer === true && 
        req.user.organizerProfile?.verificationStatus === 'verified'
    ) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized: You must be a verified organizer to perform this action.' });
    }
};

module.exports = { protect, optionalAuth, requireOrganizer };
