const express = require('express');
const router = express.Router();
const { 
    registerForEvent, 
    getMyRegistrations, 
    checkRegistrationStatus, 
    cancelRegistration, 
    joinWithTeamCode, 
    getTeamMembers, 
    getEventRegistrations, 
    checkInRegistration, 
    approveCancellation, 
    rejectCancellation,
    setProblemPreferences,
    assignProblem,
    submitProject,
    approvePayment,
    rejectPayment
} = require('../controllers/registrationController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, registerForEvent);
router.post('/join', protect, joinWithTeamCode);
router.get('/my-registrations', protect, getMyRegistrations);
router.get('/team/:teamCode', protect, getTeamMembers);
router.get('/event/:eventId', protect, getEventRegistrations);
router.get('/check/:eventId', protect, checkRegistrationStatus);
router.delete('/:eventId', protect, cancelRegistration);
router.put('/:id/checkin', protect, checkInRegistration);
router.put('/:id/approve-cancellation', protect, approveCancellation);
router.put('/:id/reject-cancellation', protect, rejectCancellation);
router.put('/:id/approve-payment', protect, approvePayment);
router.put('/:id/reject-payment', protect, rejectPayment);

// Hackathon specific routes
router.put('/:id/preferences', protect, setProblemPreferences);
router.put('/:id/assign', protect, assignProblem);
router.put('/:id/submit', protect, submitProject);

module.exports = router;
