const express = require('express');
const router = express.Router();
const { registerForEvent, getMyRegistrations, checkRegistrationStatus, cancelRegistration, joinWithTeamCode, getTeamMembers, getEventRegistrations, checkInRegistration, approveCancellation, rejectCancellation } = require('../controllers/registrationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, registerForEvent);
router.post('/join', protect, joinWithTeamCode);
router.get('/my-registrations', protect, getMyRegistrations);
router.get('/team/:teamCode', protect, getTeamMembers);
router.get('/event/:eventId', protect, getEventRegistrations);
router.get('/check/:eventId', protect, checkRegistrationStatus);
router.delete('/:eventId', protect, cancelRegistration);
router.put('/:id/checkin', protect, checkInRegistration);
router.post('/:id/approve-cancellation', protect, approveCancellation);
router.post('/:id/reject-cancellation', protect, rejectCancellation);

module.exports = router;
