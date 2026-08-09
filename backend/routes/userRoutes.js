const express = require('express');
const router = express.Router();
const { updateOnboarding, updateProfile, submitIdentityVerification } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/onboarding', protect, updateOnboarding);
router.put('/profile', protect, updateProfile);
router.post('/verify-identity', protect, submitIdentityVerification);

module.exports = router;
