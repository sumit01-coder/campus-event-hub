const Log = require('../models/Log');

// @desc    Create a system log
// @route   POST /api/logs
// @access  Public (or semi-public for frontend tracking)
const createLog = async (req, res) => {
    try {
        const { level, message, context, url, details } = req.body || {};
        
        // If it's just spam or empty, ignore
        if (!message || !context) {
            return res.status(400).json({ message: 'Message and context are required' });
        }

        const logEntry = await Log.create({
            level: level || 'error',
            message,
            context,
            url,
            details,
            userId: req.user ? req.user._id : null
        });

        res.status(201).json({ success: true, log: logEntry });
    } catch (error) {
        // Since this is the logger itself failing, we just console.error
        console.error('Failed to save log:', error);
        res.status(500).json({ message: 'Failed to create log' });
    }
};

// @desc    Get all system logs
// @route   GET /api/admin/logs
// @access  Private (Admin)
const getLogs = async (req, res) => {
    try {
        const { level, page = 1, limit = 50 } = req.query;
        
        const query = {};
        if (level && level !== 'all') {
            query.level = level;
        }

        const logs = await Log.find(query)
            .populate('userId', 'name email')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));
            
        const total = await Log.countDocuments(query);

        res.json({
            logs,
            totalPages: Math.ceil(total / parseInt(limit)),
            currentPage: parseInt(page),
            totalLogs: total
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching logs', error: error.message });
    }
};

module.exports = {
    createLog,
    getLogs
};
