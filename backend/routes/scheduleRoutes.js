const express = require('express');
const router = express.Router();
const { getMySchedule, addToSchedule, removeFromSchedule } = require('../controllers/scheduleController');
const { protect } = require('../middleware/authMiddleware');

router.get('/me', protect, getMySchedule);
router.post('/', protect, addToSchedule);
router.delete('/:eventId', protect, removeFromSchedule);

module.exports = router;
