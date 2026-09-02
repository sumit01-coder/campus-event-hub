const express = require('express');
const router = express.Router();
const { getEvents, getEventById, createEvent, updateEvent, deleteEvent, broadcastMessage, deleteBroadcast, toggleHideBroadcast, rateEvent, addCoordinator, removeCoordinator, extractProblemStatements, releaseResults, toggleLikeEvent, getEventAvailability, recommendEvents } = require('../controllers/eventController');
const { protect, requireOrganizer } = require('../middleware/authMiddleware');
const multer = require('multer');
const upload = multer({ 
    dest: 'uploads/',
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Not a PDF! Please upload a valid PDF file.'), false);
        }
    }
});

router.get('/', getEvents);
router.post('/recommend', recommendEvents);
router.get('/:id', getEventById);
router.get('/:id/availability', getEventAvailability);
router.post('/', protect, requireOrganizer, createEvent);
router.post('/extract-problems', protect, requireOrganizer, upload.single('pdf'), extractProblemStatements);
router.post('/:id/broadcast', protect, requireOrganizer, broadcastMessage);
router.delete('/:id/broadcast/:announcementId', protect, requireOrganizer, deleteBroadcast);
router.patch('/:id/broadcast/:announcementId/toggle-hide', protect, requireOrganizer, toggleHideBroadcast);
router.post('/:id/rate', protect, rateEvent);
router.post('/:id/like', protect, toggleLikeEvent);
router.post('/:id/coordinators', protect, requireOrganizer, addCoordinator);
router.delete('/:id/coordinators/:userId', protect, requireOrganizer, removeCoordinator);
router.put('/:id', protect, requireOrganizer, updateEvent);
router.delete('/:id', protect, requireOrganizer, deleteEvent);
router.put('/:id/results', protect, requireOrganizer, releaseResults);

module.exports = router;
