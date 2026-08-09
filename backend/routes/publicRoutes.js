const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const User = require('../models/User');

// GET /api/public/stats
router.get('/stats', async (req, res) => {
    try {
        const eventsCount = await Event.countDocuments();
        const usersCount = await User.countDocuments();
        
        // We will return the real counts from the DB. 
        // For campuses and satisfaction rate, we can return some base metrics 
        // since those aren't directly modeled in the DB yet.
        res.json({
            eventsHosted: eventsCount,
            activeUsers: usersCount,
            campuses: 25, // Base mock value
            satisfactionRate: 98 // Base mock value
        });
    } catch (error) {
        console.error('Error fetching public stats:', error);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
});

module.exports = router;
