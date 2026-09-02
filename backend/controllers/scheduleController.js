const Schedule = require('../models/Schedule');
const Event = require('../models/Event');

// @desc    Get user's schedule
// @route   GET /api/schedules/me
// @access  Private
const getMySchedule = async (req, res) => {
    try {
        const schedules = await Schedule.find({ userId: req.user._id })
            .populate('eventId', 'title category date time location banner_url')
            .sort({ startTime: 1 });
            
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Add event to schedule
// @route   POST /api/schedules
// @access  Private
const addToSchedule = async (req, res) => {
    try {
        const { eventId } = req.body;
        
        if (!eventId) {
            return res.status(400).json({ message: 'Event ID is required' });
        }

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Calculate start and end times
        const dateStr = new Date(event.date).toISOString().split('T')[0];
        
        // Parse time like "14:00" or "2:00 PM"
        let startTimeStr = event.time;
        // Simple logic for Hackathon demo - assuming 2 hours duration if endTime not specified
        const startDateTime = new Date(`${dateStr}T${startTimeStr.padStart(5, '0')}:00.000Z`); // Very naive, assuming HH:mm format
        if (isNaN(startDateTime.getTime())) {
            // fallback if time is unparseable
            startDateTime = new Date(event.date);
        }
        
        const endDateTime = new Date(startDateTime.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

        // Check for conflicts
        const existingSchedules = await Schedule.find({ userId: req.user._id });
        
        const conflict = existingSchedules.find(s => {
            const existingStart = new Date(s.startTime).getTime();
            const existingEnd = new Date(s.endTime).getTime();
            const newStart = startDateTime.getTime();
            const newEnd = endDateTime.getTime();
            
            return (newStart < existingEnd && newEnd > existingStart);
        });

        if (conflict) {
            return res.status(409).json({ 
                message: 'Schedule conflict detected. You have another event scheduled at this time.',
                conflictEventId: conflict.eventId
            });
        }

        const schedule = await Schedule.create({
            userId: req.user._id,
            eventId: event._id,
            startTime: startDateTime,
            endTime: endDateTime
        });

        res.status(201).json(schedule);
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Event is already in your schedule' });
        }
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Remove event from schedule
// @route   DELETE /api/schedules/:eventId
// @access  Private
const removeFromSchedule = async (req, res) => {
    try {
        const schedule = await Schedule.findOneAndDelete({ 
            userId: req.user._id, 
            eventId: req.params.eventId 
        });

        if (!schedule) {
            return res.status(404).json({ message: 'Event not found in schedule' });
        }

        res.json({ message: 'Event removed from schedule' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    getMySchedule,
    addToSchedule,
    removeFromSchedule
};
