const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

// Simulated WhatsApp OTP Store
const otpStore = new Map();

router.post('/send-otp', protect, (req, res) => {
    const { phone } = req.body;
    if (!phone) {
        return res.status(400).json({ message: 'Phone number required' });
    }
    
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(req.user._id.toString(), otp);
    
    // SIMULATION
    console.log(`[WHATSAPP SIMULATION] Sending OTP ${otp} to +${phone}`);
    
    res.json({ message: 'OTP sent successfully (Simulated)' });
});

router.post('/verify-otp', protect, (req, res) => {
    const { otp } = req.body;
    const storedOtp = otpStore.get(req.user._id.toString());
    
    if (storedOtp && storedOtp === otp) {
        otpStore.delete(req.user._id.toString());
        // Here you would mark user as whatsappVerified in DB
        res.json({ message: 'WhatsApp number verified successfully!' });
    } else {
        res.status(400).json({ message: 'Invalid or expired OTP' });
    }
});

module.exports = router;
