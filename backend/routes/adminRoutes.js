const express = require('express');
const router = express.Router();
const { loginAdmin, getAdminProfile } = require('../controllers/adminAuthController');
const { getDashboardStats, getUsers, getOrganizers, updateOrganizerStatus, getAllEvents, getAllRegistrations, getSystemHealth } = require('../controllers/adminController');
const { protectAdmin } = require('../middleware/adminMiddleware');

// Auth routes
router.post('/auth/login', loginAdmin);
router.get('/auth/me', protectAdmin, getAdminProfile);

// Dashboard Routes
router.get('/stats', protectAdmin, getDashboardStats);

// Management Routes
router.get('/users', protectAdmin, getUsers);
router.get('/organizers', protectAdmin, getOrganizers);
router.put('/organizers/:id/verify', protectAdmin, updateOrganizerStatus);
router.get('/events', protectAdmin, getAllEvents);
router.get('/registrations', protectAdmin, getAllRegistrations);
router.get('/health', protectAdmin, getSystemHealth);

const { getLogs } = require('../controllers/logController');
router.get('/logs', protectAdmin, getLogs);

module.exports = router;
