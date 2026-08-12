const express = require('express');
const router = express.Router();
const { getEvents, getEventById, createEvent, updateEvent, deleteEvent, broadcastMessage, deleteBroadcast, toggleHideBroadcast, rateEvent, addCoordinator, removeCoordinator, extractProblemStatements, releaseResults } = require('../controllers/eventController');
const { protect, requireOrganizer } = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/', protect, requireOrganizer, createEvent);
router.post('/extract-problems', protect, requireOrganizer, upload.single('pdf'), extractProblemStatements);
router.post('/:id/broadcast', protect, requireOrganizer, broadcastMessage);
router.delete('/:id/broadcast/:announcementId', protect, requireOrganizer, deleteBroadcast);
router.patch('/:id/broadcast/:announcementId/toggle-hide', protect, requireOrganizer, toggleHideBroadcast);
router.post('/:id/rate', protect, rateEvent);
router.post('/:id/coordinators', protect, requireOrganizer, addCoordinator);
router.delete('/:id/coordinators/:userId', protect, requireOrganizer, removeCoordinator);
router.put('/:id', protect, requireOrganizer, updateEvent);
router.delete('/:id', protect, requireOrganizer, deleteEvent);
router.put('/:id/results', protect, requireOrganizer, releaseResults);

module.exports = router;
