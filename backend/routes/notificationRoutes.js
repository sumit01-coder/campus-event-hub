const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { protect } = require('../middleware/authMiddleware');

// Get user's notifications
router.get('/', protect, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(50);
        res.json(notifications);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching notifications' });
    }
});

// Mark all as read
router.put('/read-all', protect, async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: req.user._id, isRead: false },
            { $set: { isRead: true } }
        );
        res.json({ message: 'Notifications marked as read' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error updating notifications' });
    }
});

// Clear all notifications
router.delete('/clear-all', protect, async (req, res) => {
    try {
        await Notification.deleteMany({ userId: req.user._id });
        res.json({ message: 'All notifications cleared' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error clearing notifications' });
    }
});

module.exports = router;
