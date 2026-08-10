const express = require('express');
const router = express.Router();
const { createLog, getLogs } = require('../controllers/logController');
const { protect } = require('../middleware/authMiddleware');
const { protectAdmin } = require('../middleware/adminMiddleware');

// Public/Semi-public route to create logs from the frontend
// We use an optional protect middleware so we can attach user info if they are logged in
// But we don't want to block errors from users who aren't logged in.
// Express allows us to just run a middleware that doesn't block if token is missing.
const optionalProtect = async (req, res, next) => {
    try {
        await protect(req, res, () => {});
    } catch (err) {
        // Ignore auth errors, just proceed without req.user
    }
    next();
};

router.post('/', optionalProtect, createLog);

module.exports = router;
