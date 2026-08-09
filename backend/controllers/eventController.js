const Event = require('../models/Event');

// @desc    Get all events
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
    try {
        const query = {};
        if (req.query.organizerId) {
            query.organizerId = req.query.organizerId;
        }
        const events = await Event.find(query).populate('organizerId', 'name email').sort({ createdAt: -1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Create an event
// @route   POST /api/events
// @access  Private (Organizer)
const createEvent = async (req, res) => {
    try {
        const { title, description, date, time, venue, image, category, price, capacity } = req.body;

        if (!title || !description || !date || !time || !venue || !image || !category || !capacity) {
            return res.status(400).json({ message: 'Please add all required fields' });
        }

        const event = await Event.create({
            title,
            description,
            date,
            time,
            venue,
            image,
            category,
            price: price || 0,
            capacity,
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
        const event = await Event.findById(req.params.id).populate('organizerId', 'name email profile organizerProfile');
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json(event);
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

        await event.deleteOne();

        res.json({ message: 'Event removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    getEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent
};
