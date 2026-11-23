const express = require('express');
const router = express.Router();
const Query = require('../models/Query');
const { protect } = require('../middleware/authMiddleware');

// Get all queries for an event (Protected: authenticated attendees/organizers)
router.get('/:eventId', protect, async (req, res) => {
    try {
        const queries = await Query.find({ eventId: req.params.eventId }).sort({ createdAt: -1 });
        res.json(queries);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching queries' });
    }
});

module.exports = router;
