const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT specifically for admin
const generateAdminToken = (adminId, isSuperAdmin) => {
    return jwt.sign({ adminId, isSuperAdmin }, process.env.JWT_SECRET, {
        expiresIn: '1d', // Shorter expiry for admin tokens
    });
};

// @desc    Authenticate an admin
// @route   POST /api/admin/auth/login
// @access  Public (Admin Portal)
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for admin email
        const admin = await Admin.findOne({ email });

        if (admin && (await bcrypt.compare(password, admin.password))) {
            res.json({
                _id: admin.id,
                name: admin.name,
                email: admin.email,
                isSuperAdmin: admin.isSuperAdmin,
                permissions: admin.permissions,
                token: generateAdminToken(admin._id, admin.isSuperAdmin),
            });
        } else {
            res.status(401).json({ message: 'Invalid admin credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get current admin profile
// @route   GET /api/admin/auth/me
// @access  Private (Admin)
const getAdminProfile = async (req, res) => {
    try {
        // req.admin is set in protectAdmin middleware
        const admin = await Admin.findById(req.admin._id).select('-password');
        if (admin) {
            res.json(admin);
        } else {
            res.status(404).json({ message: 'Admin not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

module.exports = {
    loginAdmin,
    getAdminProfile
};
