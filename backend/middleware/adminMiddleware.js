const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const protectAdmin = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get admin from token (we embedded adminId instead of id to prevent token spoofing)
            if (!decoded.adminId) {
                return res.status(401).json({ message: 'Not authorized as an admin' });
            }

            req.admin = await Admin.findById(decoded.adminId).select('-password');
            
            if (!req.admin) {
                return res.status(401).json({ message: 'Admin account not found' });
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.admin) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (req.admin.isSuperAdmin || req.admin.permissions.includes(permission)) {
            next();
        } else {
            res.status(403).json({ message: `Forbidden: Requires ${permission} permission` });
        }
    };
};

module.exports = { protectAdmin, requirePermission };
