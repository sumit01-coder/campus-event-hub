const Registration = require('../models/Registration');
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const { sendTicketEmail } = require('../services/emailService');

// Utility function to generate a random 6-character alphanumeric code
const generateTeamCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// @desc    Register for an event
// @route   POST /api/registrations
// @access  Private
const registerForEvent = async (req, res) => {
    try {
        const { eventId, participantName, email, phone, college, participationType = 'individual', teamSize = 1, paymentProof } = req.body;

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

        // Check if the user is the organizer or a coordinator
        if (event.organizerId.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'You are the organizer of this event and cannot register as a participant.' });
        }
        
        const isCoordinator = event.coordinators && event.coordinators.some(c => c.userId.toString() === req.user._id.toString());
        if (isCoordinator) {
            return res.status(400).json({ message: 'You are a coordinator/volunteer for this event and cannot register as a participant.' });
        }

        // Determine payment status
        let paymentStatus = 'free';
        if (event.isPaid && event.price > 0) {
            if (!paymentProof) {
                return res.status(400).json({ message: 'Payment proof is required for paid events' });
            }
            paymentStatus = 'pending_verification';
        }

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
            paymentStatus: paymentStatus,
            paymentProof: paymentProof
        });

        await Event.findByIdAndUpdate(eventId, { $inc: { registeredCount: 1 } });

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
            req.io.emit('registration_updated', { eventId: eventId.toString() });
        }

        // Send Email Ticket (only if free)
        if (paymentStatus === 'free') {
            try {
                const ticketId = registration._id.toString().substring(registration._id.toString().length - 8).toUpperCase();
                // Assuming frontend URL is http://localhost:5173 for local, fallback to that
                const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
                const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(frontendUrl + '/checkin/' + event._id + '/' + registration._id)}`;
                
                await sendTicketEmail(
                    registration.email || req.user.email,
                    registration.participantName,
                    event.title,
                    ticketId,
                    qrDataUrl
                );
            } catch (emailErr) {
                console.error("Failed to send ticket email", emailErr);
                // Non-blocking error
            }
        } else {
            // Notify organizer about pending payment
            const organizerNotif = new Notification({
                userId: event.organizerId,
                title: 'New Pending Payment',
                message: `${participantName} uploaded payment proof for ${event.title}. Please verify.`,
                type: 'info',
                link: `/hosted-events`
            });
            await organizerNotif.save();
            if (req.io) {
                req.io.to(event.organizerId.toString()).emit('new_notification', organizerNotif);
            }
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
        await Event.findByIdAndUpdate(registration.eventId, { $inc: { registeredCount: -1 } });

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

        await Event.findByIdAndUpdate(eventId, { $inc: { registeredCount: 1 } });

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
        }).select('participantName email isTeamLeader status cancellationRequested teamSize');

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

        // Ensure user is the organizer or a coordinator of the event
        const isOrganizer = event.organizerId.toString() === req.user._id.toString();
        const isCoordinator = event.coordinators && event.coordinators.some(c => c.userId.toString() === req.user._id.toString());
        
        if (!isOrganizer && !isCoordinator) {
            return res.status(401).json({ message: 'Not authorized. Only the event organizer or coordinators can view registrations.' });
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

        const isOrganizer = event.organizerId.toString() === req.user._id.toString();
        const isCoordinator = event.coordinators && event.coordinators.some(c => c.userId.toString() === req.user._id.toString());

        if (!isOrganizer && !isCoordinator) {
            return res.status(401).json({ message: 'Not authorized. Only the event organizer or coordinators can check-in attendees.' });
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

        const eventId = memberReg.eventId;
        await Registration.findByIdAndDelete(memberReg._id);
        await Event.findByIdAndUpdate(eventId, { $inc: { registeredCount: -1 } });
        
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

// @desc    Update problem statement preferences (Hackathon)
// @route   PUT /api/registrations/:id/preferences
// @access  Private (Registered User / Team Leader)
const setProblemPreferences = async (req, res) => {
    try {
        const { preferences } = req.body;
        const registration = await Registration.findById(req.params.id);

        if (!registration) return res.status(404).json({ message: 'Registration not found' });
        
        // Ensure the logged in user owns this registration
        if (registration.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this registration' });
        }

        registration.preferences = preferences;
        await registration.save();
        res.json(registration);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Assign a problem to a team (Hackathon)
// @route   PUT /api/registrations/:id/assign
// @access  Private (Organizer)
const assignProblem = async (req, res) => {
    try {
        const { assignedProblemId } = req.body;
        const registration = await Registration.findById(req.params.id).populate('eventId');
        
        if (!registration) return res.status(404).json({ message: 'Registration not found' });

        // Ensure logged in user is the organizer or coordinator of the event
        const isOrganizer = registration.eventId.organizerId.toString() === req.user._id.toString();
        const isCoordinator = registration.eventId.coordinators && registration.eventId.coordinators.some(c => c.userId.toString() === req.user._id.toString());

        if (!isOrganizer && !isCoordinator) {
            return res.status(403).json({ message: 'Not authorized. Only the event organizer or coordinators can assign problems.' });
        }

        registration.assignedProblemId = assignedProblemId;
        await registration.save();
        res.json(registration);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Submit a project (Hackathon)
// @route   PUT /api/registrations/:id/submit
// @access  Private (Registered User / Team Leader)
const submitProject = async (req, res) => {
    try {
        const { githubLink, liveDemoLink, presentationLink } = req.body;
        const registration = await Registration.findById(req.params.id);

        if (!registration) return res.status(404).json({ message: 'Registration not found' });
        
        if (registration.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        registration.projectSubmission = {
            githubLink,
            liveDemoLink,
            presentationLink,
            submittedAt: new Date()
        };
        
        await registration.save();
        res.json(registration);
        res.json(registration);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// @desc    Approve a pending payment
// @route   PUT /api/registrations/:id/approve-payment
// @access  Private (Organizer)
const approvePayment = async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id).populate('eventId');
        if (!registration) return res.status(404).json({ message: 'Registration not found' });
        
        if (registration.eventId.organizerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        registration.paymentStatus = 'verified';
        await registration.save();

        // Send Email Ticket now that it's approved (Non-blocking)
        const ticketId = registration._id.toString().substring(registration._id.toString().length - 8).toUpperCase();
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const qrDataUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(frontendUrl + '/checkin/' + registration.eventId._id + '/' + registration._id)}`;
        
        sendTicketEmail(
            registration.email,
            registration.participantName,
            registration.eventId.title,
            ticketId,
            qrDataUrl
        ).catch(emailErr => {
            console.error("Failed to send ticket email upon approval", emailErr);
        });

        // Notify user
        const notif = new Notification({
            userId: registration.userId,
            title: 'Payment Verified!',
            message: `Your payment for ${registration.eventId.title} has been verified and your ticket is ready.`,
            type: 'success',
            link: '/my-events'
        });
        await notif.save();
        if (req.io) {
            req.io.to(registration.userId.toString()).emit('new_notification', notif);
        }

        res.json(registration);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Reject a pending payment
// @route   PUT /api/registrations/:id/reject-payment
// @access  Private (Organizer)
const rejectPayment = async (req, res) => {
    try {
        const registration = await Registration.findById(req.params.id).populate('eventId');
        if (!registration) return res.status(404).json({ message: 'Registration not found' });
        
        if (registration.eventId.organizerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        registration.paymentStatus = 'rejected';
        await registration.save();

        // Notify user
        const notif = new Notification({
            userId: registration.userId,
            title: 'Payment Rejected',
            message: `Your payment proof for ${registration.eventId.title} was rejected by the organizer. Please try registering again.`,
            type: 'error',
            link: `/event/${registration.eventId._id}`
        });
        await notif.save();
        if (req.io) {
            req.io.to(registration.userId.toString()).emit('new_notification', notif);
        }

        res.json(registration);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
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
    rejectCancellation,
    setProblemPreferences,
    assignProblem,
    submitProject,
    approvePayment,
    rejectPayment
};
