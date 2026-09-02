const User = require('../models/User');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const os = require('os');
const mongoose = require('mongoose');

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

// @desc    Get all organizers (including pending applications)
// @route   GET /api/admin/organizers
// @access  Private (Admin)
const getOrganizers = async (req, res) => {
    try {
        const organizers = await User.find({
            $or: [
                { 'capabilities.organizer': true },
                { 'organizerProfile.verificationStatus': { $in: ['pending', 'verified', 'rejected'] } }
            ]
        })
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
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.organizerProfile.verificationStatus = status;
        
        if (status === 'verified') {
            user.capabilities.organizer = true;
        } else if (status === 'rejected' || status === 'none') {
            user.capabilities.organizer = false;
        }

        await user.save();

        res.json({ message: `Organizer status updated to ${status}`, user });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update organizer status', error: error.message });
    }
};

// @desc    Get all events system-wide
// @route   GET /api/admin/events
// @access  Private (Admin)
const getAllEvents = async (req, res) => {
    try {
        const events = await Event.find()
            .populate('organizerId', 'name email')
            .sort({ createdAt: -1 });
        res.json(events);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch events', error: error.message });
    }
};

// @desc    Get all registrations system-wide
// @route   GET /api/admin/registrations
// @access  Private (Admin)
const getAllRegistrations = async (req, res) => {
    try {
        const registrations = await Registration.find()
            .populate('userId', 'name email')
            .populate('eventId', 'title category date')
            .sort({ createdAt: -1 });
        res.json(registrations);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch registrations', error: error.message });
    }
};

// @desc    Get system health metrics
// @route   GET /api/admin/health
// @access  Private (Admin)
const getSystemHealth = async (req, res) => {
    try {
        const totalMemory = os.totalmem();
        const freeMemory = os.freemem();
        const usedMemory = totalMemory - freeMemory;
        
        const healthData = {
            uptime: process.uptime(),
            memory: {
                total: (totalMemory / 1024 / 1024 / 1024).toFixed(2) + ' GB',
                free: (freeMemory / 1024 / 1024 / 1024).toFixed(2) + ' GB',
                used: (usedMemory / 1024 / 1024 / 1024).toFixed(2) + ' GB',
                usedPercentage: ((usedMemory / totalMemory) * 100).toFixed(1)
            },
            cpu: {
                cores: os.cpus().length,
                loadAvg: os.loadavg()
            },
            database: {
                status: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
                name: mongoose.connection.name
            },
            timestamp: new Date()
        };
        
        res.json(healthData);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch health data', error: error.message });
    }
};

module.exports = {
    getDashboardStats,
    getUsers,
    getOrganizers,
    updateOrganizerStatus,
    getAllEvents,
    getAllRegistrations,
    getSystemHealth
};
