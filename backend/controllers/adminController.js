const User = require('../models/User');
const Event = require('../models/Event');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const activeOrganizers = await User.countDocuments({ 'capabilities.organizer': true });
        const totalEvents = await Event.countDocuments();
        const pendingVerifications = await User.countDocuments({ 'organizerProfile.verificationStatus': 'pending' });

        res.json({
            totalUsers,
            activeOrganizers,
            totalEvents,
            pendingVerifications
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch dashboard stats', error: error.message });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch users', error: error.message });
    }
};

// @desc    Get all organizers
// @route   GET /api/admin/organizers
// @access  Private (Admin)
const getOrganizers = async (req, res) => {
    try {
        const organizers = await User.find({ 'capabilities.organizer': true })
            .select('-password')
            .sort({ createdAt: -1 });
        res.json(organizers);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch organizers', error: error.message });
    }
};

// @desc    Update organizer verification status
// @route   PUT /api/admin/organizers/:id/verify
// @access  Private (Admin)
const updateOrganizerStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['none', 'pending', 'verified', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const user = await User.findById(req.params.id);
        
        if (!user || !user.capabilities.organizer) {
            return res.status(404).json({ message: 'Organizer not found' });
        }

        user.organizerProfile.verificationStatus = status;
        await user.save();

        res.json({ message: `Organizer status updated to ${status}`, user });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update organizer status', error: error.message });
    }
};

module.exports = {
    getDashboardStats,
    getUsers,
    getOrganizers,
    updateOrganizerStatus
};
