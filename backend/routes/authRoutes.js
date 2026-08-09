const express = require('express');
const router = express.Router();
const { registerUser, loginUser, sendVerificationEmail, verifyEmail } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/send-verification', protect, sendVerificationEmail);
router.post('/verify-email', protect, verifyEmail);

module.exports = router;
