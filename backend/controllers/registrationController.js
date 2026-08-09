const Registration = require('../models/Registration');
const Event = require('../models/Event');
const Notification = require('../models/Notification');

// Utility function to generate a random 6-character alphanumeric code
const generateTeamCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// @desc    Register for an event
// @route   POST /api/registrations
// @access  Private
const registerForEvent = async (req, res) => {
    try {
        const { eventId, participantName, email, phone, college, participationType = 'individual', teamSize = 1 } = req.body;

        // Check if event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Check if already registered
        const existingRegistration = await Registration.findOne({
            userId: req.user._id,
            eventId: eventId
        });

        if (existingRegistration) {
            return res.status(400).json({ message: 'You are already registered for this event.' });
        }

        // Determine payment status (naive check based on event price)
        const paymentStatus = event.price > 0 ? 'paid' : 'free'; // In a real app, this would integrate with a payment gateway

        let teamCode = null;
        let isTeamLeader = false;

        if (participationType === 'group' && event.participationType !== 'individual') {
            teamCode = generateTeamCode();
            isTeamLeader = true;
        }

        const registration = await Registration.create({
            userId: req.user._id,
            eventId: eventId,
            participantName,
            email,
            phone,
            college,
            participationType,
            teamCode,
            isTeamLeader,
            teamSize: isTeamLeader ? teamSize : 1,
            status: 'registered',
            paymentStatus: paymentStatus
        });

        // Optionally, increment event.registered count here (if we add that to the schema)
        
        // Notify user
        const notif = new Notification({
            userId: req.user._id,
            title: 'Registration Successful',
            message: `Your registration for ${event.title} was successful!`,
            type: 'success',
            link: '/my-events'
        });
        await notif.save();
        if (req.io) {
            req.io.to(req.user._id.toString()).emit('new_notification', notif);
        }
        
        res.status(201).json(registration);
    } catch (error) {
        if (error.code === 11000) {
             return res.status(400).json({ message: 'You are already registered for this event.' });
        }
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get user's registrations
// @route   GET /api/registrations/my-registrations
// @access  Private
const getMyRegistrations = async (req, res) => {
    try {
        // Find all registrations for this user, populate the event details
        const registrations = await Registration.find({ userId: req.user._id })
            .populate({
                path: 'eventId',
                populate: { path: 'organizerId', select: 'name email' } // optionally deeply populate organizer
            })
            .sort({ createdAt: -1 });

        // Map it so the frontend receives an array of Event objects (with an attached registration info if needed)
        // This makes it compatible with the existing EventCard component.
        const events = registrations
            .filter(r => r.eventId != null) // Safety check in case event was deleted
            .map(r => ({
                ...r.eventId.toObject(),
                registrationStatus: r.status,
                registrationDate: r.createdAt,
                registrationId: r._id,
                userReg: {
                    _id: r._id,
                    participantName: r.participantName,
                    email: r.email,
                    phone: r.phone,
                    college: r.college,
                    participationType: r.participationType,
                    teamCode: r.teamCode,
                    joinedTeamCode: r.joinedTeamCode,
                    isTeamLeader: r.isTeamLeader,
                    paymentStatus: r.paymentStatus,
                    createdAt: r.createdAt
                }
            }));

        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Check if user is registered for an event
// @route   GET /api/registrations/check/:eventId
// @access  Private
const checkRegistrationStatus = async (req, res) => {
    try {
        const registration = await Registration.findOne({
            userId: req.user._id,
            eventId: req.params.eventId
        });
        
        if (registration) {
            res.json({ isRegistered: true, registration });
        } else {
            res.json({ isRegistered: false });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Cancel/Revoke event registration
// @route   DELETE /api/registrations/:eventId
// @access  Private
const cancelRegistration = async (req, res) => {
    try {
        const registration = await Registration.findOne({
            userId: req.user._id,
            eventId: req.params.eventId
        });

        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        // If it's a team member trying to cancel, request permission first
        if (registration.participationType === 'group' && !registration.isTeamLeader) {
            registration.cancellationRequested = true;
            await registration.save();
            return res.json({ message: 'Cancellation request sent to Team Leader', status: 'requested' });
        }

        // Otherwise, allow direct cancellation (individual or team leader)
        await Registration.findByIdAndDelete(registration._id);

        res.json({ message: 'Successfully canceled registration', status: 'cancelled' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Join a team via code
// @route   POST /api/registrations/join
// @access  Private
const joinWithTeamCode = async (req, res) => {
    try {
        const { teamCode, participantName, email, phone, college } = req.body;

        // Find the team leader's registration
        const leaderRegistration = await Registration.findOne({ teamCode: teamCode.toUpperCase(), isTeamLeader: true });
        
        if (!leaderRegistration) {
            return res.status(404).json({ message: 'Invalid Team Code. Please check and try again.' });
        }

        const eventId = leaderRegistration.eventId;
        const event = await Event.findById(eventId);

        if (!event) {
            return res.status(404).json({ message: 'Event no longer exists.' });
        }

        // Check if this user is already registered for this event
        const existingReg = await Registration.findOne({ userId: req.user._id, eventId });
        if (existingReg) {
            return res.status(400).json({ message: 'You are already registered for this event.' });
        }

        // Check group capacity
        // Count leader + all members who joined this code
        const currentMembersCount = await Registration.countDocuments({ 
            $or: [{ teamCode: teamCode.toUpperCase() }, { joinedTeamCode: teamCode.toUpperCase() }] 
        });

        if (currentMembersCount >= leaderRegistration.teamSize) {
            return res.status(400).json({ message: `This team is already full (Max ${leaderRegistration.teamSize} members).` });
        }

        // Create the registration (payment is covered by the leader, so it's free/paid for the joiner automatically)
        const joinRegistration = await Registration.create({
            userId: req.user._id,
            eventId: eventId,
            participantName,
            email,
            phone,
            college,
            participationType: 'group',
            joinedTeamCode: teamCode.toUpperCase(),
            isTeamLeader: false,
            status: 'registered',
            paymentStatus: leaderRegistration.paymentStatus
        });

        res.status(201).json({ message: 'Successfully joined the team!', registration: joinRegistration, event });

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all members of a team
// @route   GET /api/registrations/team/:teamCode
// @access  Private
const getTeamMembers = async (req, res) => {
    try {
        const teamCode = req.params.teamCode.toUpperCase();
        
        // Find all registrations with this teamCode (either as leader or joined)
        const teamMembers = await Registration.find({
            $or: [{ teamCode: teamCode }, { joinedTeamCode: teamCode }]
        }).select('participantName email isTeamLeader status');

        res.json(teamMembers);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Get all registrations for an event (Organizer only)
// @route   GET /api/registrations/event/:eventId
// @access  Private
const getEventRegistrations = async (req, res) => {
    try {
        const eventId = req.params.eventId;
        
        // Ensure event exists
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Ensure user is the organizer of the event
        if (event.organizerId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized. Only the event organizer can view registrations.' });
        }

        // Fetch all registrations for this event
        const registrations = await Registration.find({ eventId })
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });

        res.json(registrations);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Mark attendance via QR scan
// @route   PUT /api/registrations/:id/checkin
// @access  Private
const checkInRegistration = async (req, res) => {
    try {
        const registrationId = req.params.id;

        const registration = await Registration.findById(registrationId);
        if (!registration) {
            return res.status(404).json({ message: 'Registration not found' });
        }

        const event = await Event.findById(registration.eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.organizerId.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized. Only the event organizer can check-in attendees.' });
        }

        registration.status = 'attended';
        await registration.save();

        res.json({ message: 'Check-in successful', registration });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Approve team member cancellation request
// @route   POST /api/registrations/:id/approve-cancellation
// @access  Private
const approveCancellation = async (req, res) => {
    try {
        const memberReg = await Registration.findById(req.params.id);
        if (!memberReg) return res.status(404).json({ message: 'Registration not found' });

        // Ensure current user is the team leader
        const leaderReg = await Registration.findOne({
            userId: req.user._id,
            teamCode: memberReg.joinedTeamCode,
            isTeamLeader: true
        });

        if (!leaderReg) return res.status(401).json({ message: 'Not authorized. Only the team leader can approve this.' });

        await Registration.findByIdAndDelete(memberReg._id);
        res.json({ message: 'Cancellation approved. Member removed.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Reject team member cancellation request
// @route   POST /api/registrations/:id/reject-cancellation
// @access  Private
const rejectCancellation = async (req, res) => {
    try {
        const memberReg = await Registration.findById(req.params.id);
        if (!memberReg) return res.status(404).json({ message: 'Registration not found' });

        // Ensure current user is the team leader
        const leaderReg = await Registration.findOne({
            userId: req.user._id,
            teamCode: memberReg.joinedTeamCode,
            isTeamLeader: true
        });

        if (!leaderReg) return res.status(401).json({ message: 'Not authorized. Only the team leader can reject this.' });

        memberReg.cancellationRequested = false;
        await memberReg.save();
        res.json({ message: 'Cancellation rejected. Member remains on the team.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

module.exports = {
    registerForEvent,
    getMyRegistrations,
    checkRegistrationStatus,
    cancelRegistration,
    joinWithTeamCode,
    getTeamMembers,
    getEventRegistrations,
    checkInRegistration,
    approveCancellation,
    rejectCancellation
};
