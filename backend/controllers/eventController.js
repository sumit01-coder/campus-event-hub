const Event = require('../models/Event');
const Registration = require('../models/Registration');
const Notification = require('../models/Notification');
const { sendBroadcastEmail } = require('../services/emailService');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
    try {
        const query = {};
        if (req.query.organizerId) {
            query.$or = [
                { organizerId: req.query.organizerId },
                { 'coordinators.userId': req.query.organizerId }
            ];
        }
        // Pagination
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20; // Default 20 events per page
        const startIndex = (page - 1) * limit;

        const total = await Event.countDocuments(query);
        const events = await Event.find(query)
            .populate('organizerId', 'name email')
            .sort({ createdAt: -1 })
            .skip(startIndex)
            .limit(limit);

        res.json({
            events,
            page,
            pages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Create an event
// @route   POST /api/events
// @access  Private (Organizer)
const createEvent = async (req, res) => {
    try {
        const { 
            title, description, date, time, venue, image, category, price, capacity,
            participationType, maxGroupSize, registrationDeadline, isHackathon 
        } = req.body;

        if (!title || !description || !date || !time || !venue || !image || !category || !capacity) {
            return res.status(400).json({ message: 'Please add all required fields' });
        }

        const numericPrice = parseFloat(price) || 0;

        const event = await Event.create({
            title,
            description,
            date,
            time,
            venue,
            image,
            category,
            price: numericPrice,
            isPaid: numericPrice > 0,
            capacity,
            participationType: participationType || 'individual',
            maxGroupSize: maxGroupSize || 1,
            registrationDeadline,
            isHackathon: isHackathon || false,
            organizerId: req.user._id // Attached by auth middleware
        });

        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id).populate('organizerId', 'name email profile organizerProfile paymentConfig');
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        
        // Get the live registration count
        const registrationsCount = await Registration.countDocuments({ 
            eventId: event._id, 
            status: { $ne: 'cancelled' } 
        });

        res.json({ ...event.toObject(), registrationsCount });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update an event
// @route   PUT /api/events/:id
// @access  Private (Organizer)
const updateEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Make sure user owns the event
        if (event.organizerId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized to update this event' });
        }

        if (req.body.price !== undefined) {
            const numericPrice = parseFloat(req.body.price) || 0;
            req.body.price = numericPrice;
            req.body.isPaid = numericPrice > 0;
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json(updatedEvent);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Delete an event
// @route   DELETE /api/events/:id
// @access  Private (Organizer)
const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Make sure user owns the event
        if (event.organizerId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'User not authorized to delete this event' });
        }

        // Cascade delete all registrations for this event
        await Registration.deleteMany({ eventId: req.params.id });

        // Delete the image file if it exists locally
        if (event.image && event.image.startsWith('/uploads/')) {
            const imagePath = path.join(__dirname, '..', event.image);
            fs.unlink(imagePath, (err) => {
                if (err && err.code !== 'ENOENT') {
                    console.error('Failed to delete event image:', err);
                }
            });
        }

        await event.deleteOne();

        res.json({ message: 'Event removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Broadcast message to all registered attendees
// @route   POST /api/events/:id/broadcast
// @access  Private (Organizer)
const broadcastMessage = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Make sure user owns the event OR is a coordinator
        const isOrganizer = event.organizerId.toString() === req.user._id.toString();
        const isCoordinator = event.coordinators && event.coordinators.some(c => c.userId.toString() === req.user._id.toString());
        
        if (!isOrganizer && !isCoordinator) {
            return res.status(401).json({ message: 'User not authorized to broadcast for this event' });
        }

        const registrations = await Registration.find({ eventId: req.params.id, status: 'registered' });
        
        // Save broadcast history
        event.announcements.push({ message });
        await event.save();
        
        // Broadcast to all users currently viewing the event page (for real-time update of announcements list)
        if (req.io) {
            req.io.to(req.params.id.toString()).emit('new_announcement', { message, date: new Date() });
        }

        let count = 0;
        for (const reg of registrations) {
            const notif = new Notification({
                userId: reg.userId._id ? reg.userId._id : reg.userId,
                title: `Announcement: ${event.title}`,
                message: message,
                type: 'info',
                link: `/event/${event._id}`
            });
            await notif.save();
            
            // Real-time notification
            if (req.io) {
                req.io.to(reg.userId._id.toString()).emit('new_notification', notif);
            }

            // Email Broadcast removed as per user request to use system notifications only
            count++;
        }

        res.json({ message: `Broadcast sent to ${count} attendees successfully.` });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Delete a broadcast announcement
// @route   DELETE /api/events/:id/broadcast/:announcementId
// @access  Private (Organizer only)
const deleteBroadcast = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const isOrganizer = event.organizerId.toString() === req.user._id.toString();
        const isCoordinator = event.coordinators && event.coordinators.some(c => c.userId.toString() === req.user._id.toString());
        
        if (!isOrganizer && !isCoordinator) {
            return res.status(401).json({ message: 'User not authorized to manage broadcasts for this event' });
        }

        // Filter out the announcement
        event.announcements = event.announcements.filter(a => a._id.toString() !== req.params.announcementId);
        await event.save();

        // Broadcast to all users currently viewing the event page
        if (req.io) {
            req.io.to(req.params.id.toString()).emit('delete_announcement', req.params.announcementId);
        }

        res.json({ message: 'Broadcast announcement deleted successfully', announcements: event.announcements });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Toggle hide/show a broadcast announcement
// @route   PATCH /api/events/:id/broadcast/:announcementId/toggle-hide
// @access  Private (Organizer only)
const toggleHideBroadcast = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const isOrganizer = event.organizerId.toString() === req.user._id.toString();
        const isCoordinator = event.coordinators && event.coordinators.some(c => c.userId.toString() === req.user._id.toString());
        if (!isOrganizer && !isCoordinator) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const announcement = event.announcements.id(req.params.announcementId);
        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        announcement.isHidden = !announcement.isHidden;
        await event.save();

        // Emit to attendees so they see or lose the announcement live
        if (req.io) {
            if (announcement.isHidden) {
                req.io.to(req.params.id.toString()).emit('delete_announcement', req.params.announcementId);
            } else {
                req.io.to(req.params.id.toString()).emit('new_announcement', announcement);
            }
        }

        res.json({ message: `Announcement ${announcement.isHidden ? 'hidden' : 'visible'}`, announcement });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Rate an event
// @route   POST /api/events/:id/rate
// @access  Private
const rateEvent = async (req, res) => {
    try {
        const { rating, review } = req.body;
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Valid rating (1-5) is required' });
        }

        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if event is in the past
        if (new Date(event.date) >= new Date()) {
            return res.status(400).json({ message: 'You can only rate events that have already passed' });
        }

        // Check if user is registered for the event
        const isRegistered = await Registration.findOne({ eventId: event._id, userId: req.user._id });
        if (!isRegistered) {
            return res.status(403).json({ message: 'Only attendees can rate this event' });
        }

        // Check if user already rated
        const existingRating = event.ratings.find(r => r.userId.toString() === req.user._id.toString());
        if (existingRating) {
            return res.status(400).json({ message: 'You have already rated this event' });
        }

        event.ratings.push({ userId: req.user._id, rating, review });
        await event.save();

        res.status(201).json({ message: 'Rating submitted successfully', ratings: event.ratings });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Add a coordinator to an event
// @route   POST /api/events/:id/coordinators
// @access  Private (Organizer only)
const addCoordinator = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.organizerId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Only the main organizer can add coordinators' });
        }

        const User = require('../models/User');
        const userToAdd = await User.findOne({ email });
        
        if (!userToAdd) {
            return res.status(404).json({ message: 'User with this email not found on the platform' });
        }

        if (userToAdd._id.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'You are already the main organizer of this event' });
        }

        const alreadyExists = event.coordinators.some(c => c.userId.toString() === userToAdd._id.toString());
        if (alreadyExists) {
            return res.status(400).json({ message: 'User is already a coordinator for this event' });
        }

        // Check if user is already registered as a participant for this event
        const Registration = require('../models/Registration');
        const isParticipant = await Registration.findOne({ eventId: event._id, userId: userToAdd._id, status: { $ne: 'cancelled' } });
        if (isParticipant) {
            return res.status(400).json({ message: 'Cannot assign user as volunteer: they are already registered as a participant for this event.' });
        }

        event.coordinators.push({
            userId: userToAdd._id,
            name: userToAdd.name,
            email: userToAdd.email,
            role: 'volunteer'
        });

        await event.save();

        // Add volunteer capability to user
        userToAdd.capabilities.volunteer = true;
        await userToAdd.save();

        res.status(200).json({ message: 'Coordinator added successfully', coordinators: event.coordinators });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Remove a coordinator from an event
// @route   DELETE /api/events/:id/coordinators/:userId
// @access  Private (Organizer only)
const removeCoordinator = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.organizerId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Only the main organizer can remove coordinators' });
        }

        event.coordinators = event.coordinators.filter(c => c.userId.toString() !== req.params.userId);
        
        await event.save();

        // Check if user is still a coordinator in other events
        const User = require('../models/User');
        const otherEvents = await Event.countDocuments({ 'coordinators.userId': req.params.userId });
        if (otherEvents === 0) {
            await User.findByIdAndUpdate(req.params.userId, { 'capabilities.volunteer': false });
        }

        res.status(200).json({ message: 'Coordinator removed successfully', coordinators: event.coordinators });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Extract problem statements from PDF
// @route   POST /api/events/extract-problems
// @access  Private (Organizer)
const extractProblemStatements = async (req, res) => {
    const { spawn } = require('child_process');
    const path = require('path');
    const fs = require('fs');

    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No PDF file uploaded' });
        }

        const pdfPath = req.file.path;
        const scriptPath = path.join(__dirname, '../scripts/extract_problems.py');
        
        const pythonProcess = spawn('python', [scriptPath, pdfPath]);
        
        let stdoutData = '';
        let stderrData = '';
        
        pythonProcess.stdout.on('data', (data) => {
            stdoutData += data.toString();
        });
        
        pythonProcess.stderr.on('data', (data) => {
            stderrData += data.toString();
        });
        
        pythonProcess.on('close', (code) => {
            fs.unlink(pdfPath, (err) => {
                if (err) console.error("Error deleting temp pdf:", err);
            });
            
            if (code !== 0) {
                console.error(`python process exited with code ${code}. Stderr: ${stderrData}`);
                return res.status(500).json({ message: 'Failed to extract PDF data' });
            }
            
            try {
                const result = JSON.parse(stdoutData);
                if (result.success) {
                    res.json(result.data);
                } else {
                    res.status(400).json({ message: result.error || 'Failed to parse PDF' });
                }
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                res.status(500).json({ message: 'Error parsing python output' });
            }
        });
        
        pythonProcess.on('error', (error) => {
            fs.unlink(pdfPath, (err) => {
                if (err) console.error("Error deleting temp pdf:", err);
            });
            console.error(`spawn error: ${error}`);
            if (!res.headersSent) {
                res.status(500).json({ message: 'Failed to spawn python process' });
            }
        });
    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({ message: 'Server Error', error: error.message });
        }
    }
};

// @desc    Toggle announcement visibility
// @route   PUT /api/events/:id/announcements/:announcementId/toggle
// @access  Private (Organizer/Coordinator)
const toggleAnnouncement = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const isOrganizer = event.organizerId.toString() === req.user._id.toString();
        const isCoordinator = event.coordinators && event.coordinators.some(c => c.userId.toString() === req.user._id.toString());
        if (!isOrganizer && !isCoordinator) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const announcement = event.announcements.id(req.params.announcementId);
        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' });
        }

        announcement.isHidden = !announcement.isHidden;
        await event.save();

        // Emit to attendees so they see or lose the announcement live
        if (req.io) {
            if (announcement.isHidden) {
                req.io.to(req.params.id.toString()).emit('delete_announcement', req.params.announcementId);
            } else {
                req.io.to(req.params.id.toString()).emit('new_announcement', announcement);
            }
        }

        res.json({ message: `Announcement ${announcement.isHidden ? 'hidden' : 'visible'}`, announcement });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Update and release event results
// @route   PUT /api/events/:id/results
// @access  Private (Organizer only)
const releaseResults = async (req, res) => {
    try {
        const { isReleased, winners } = req.body;
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.organizerId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Only the organizer can release results' });
        }

        event.results = {
            isReleased: isReleased !== undefined ? isReleased : event.results?.isReleased,
            winners: winners || event.results?.winners || []
        };

        await event.save();
        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Toggle like status for an event
// @route   POST /api/events/:id/like
// @access  Private
const toggleLikeEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const userId = req.user._id;
        
        // Initialize likes array if undefined
        if (!event.likes) {
            event.likes = [];
        }

        const likeIndex = event.likes.findIndex(id => id.toString() === userId.toString());

        if (likeIndex !== -1) {
            // User already liked, so unlike
            event.likes.splice(likeIndex, 1);
        } else {
            // User has not liked, so like
            event.likes.push(userId);
        }

        await event.save();
        res.status(200).json({ likes: event.likes });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent,
    broadcastMessage,
    deleteBroadcast,
    toggleHideBroadcast,
    rateEvent,
    addCoordinator,
    removeCoordinator,
    extractProblemStatements,
    releaseResults,
    toggleLikeEvent
};
