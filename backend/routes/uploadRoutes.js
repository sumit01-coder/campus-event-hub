const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/authMiddleware');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up Multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Create unique filename with safe extensions based on exact mime type
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        let ext = '.png'; // default fallback
        if (file.mimetype === 'image/jpeg') ext = '.jpg';
        if (file.mimetype === 'image/png') ext = '.png';
        if (file.mimetype === 'image/webp') ext = '.webp';
        
        cb(null, uniqueSuffix + ext);
    }
});

// File filter (accept exact safe image mimetypes only)
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload a valid JPEG, PNG, or WEBP file.'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// POST /api/upload
router.post('/', protect, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }
        
        // Return the URL to access the uploaded file
        // The frontend will use this URL in the event creation
        const imageUrl = `/uploads/${req.file.filename}`;
        
        res.json({ 
            message: 'File uploaded successfully',
            imageUrl: imageUrl 
        });
    } catch (error) {
        console.error('Error in file upload:', error);
        res.status(500).json({ message: 'Server error during upload' });
    }
});

module.exports = router;
