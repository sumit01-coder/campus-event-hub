const express = require('express');
const router = express.Router();
const Query = require('../models/Query');

// Get all queries for an event
router.get('/:eventId', async (req, res) => {
    try {
        const queries = await Query.find({ eventId: req.params.eventId }).sort({ createdAt: -1 });
        res.json(queries);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching queries' });
    }
});

module.exports = router;
