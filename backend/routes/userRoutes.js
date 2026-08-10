const express = require('express');
const router = express.Router();
const { updateOnboarding, updateProfile, submitIdentityVerification, deleteAccount } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/onboarding', protect, updateOnboarding);
router.put('/profile', protect, updateProfile);
router.post('/verify-identity', protect, submitIdentityVerification);
router.delete('/profile', protect, deleteAccount);

module.exports = router;
