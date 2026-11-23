require('dotenv').config();
if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined.');
    process.exit(1);
}
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const sanitize = require('./middleware/sanitizeMiddleware');
const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
        methods: ["GET", "POST"],
        credentials: true
    }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// Strict CORS Configuration
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());
app.use(sanitize); // Custom recursive sanitizer using xss

// Global API Rate Limiter
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // limit each IP to 500 requests per windowMs
    message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/api', globalLimiter);

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // limit each IP to 20 login requests per windowMs
    message: { message: 'Too many login attempts, please try again after 15 minutes' }
});

// Attach io to req
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic Route
app.get('/', (req, res) => {
    res.send('Campus EventHub API is running...');
});

// Routes
const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit registration attempts to 10 per 15 minutes
    message: { message: 'Too many registration attempts, please try again after 15 minutes' }
});
app.use('/api/auth/login', loginLimiter);
app.use('/api/auth/register', registerLimiter);

// Import Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const publicRoutes = require('./routes/publicRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const adminRoutes = require('./routes/adminRoutes');
const queryRoutes = require('./routes/queryRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const logRoutes = require('./routes/logRoutes');
const whatsappRoutes = require('./routes/whatsappRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const aiRoutes = require('./routes/aiRoutes');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/queries', queryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/ai', aiRoutes);

// Initialize Cron Jobs
require('./jobs/reminderCron');

// Socket.IO Logic
const Query = require('./models/Query');
const Notification = require('./models/Notification');
const Registration = require('./models/Registration');
const Event = require('./models/Event');
const User = require('./models/User');

io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token || socket.handshake.query?.token;
        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            return next(new Error('Authentication error: User not found'));
        }
        
        socket.user = user;
        next();
    } catch (err) {
        return next(new Error('Authentication error: Invalid token'));
    }
});

// Track presence: { eventId -> Set of { userId, name, role } }
const eventPresence = new Map();

io.on('connection', (socket) => {
    console.log('User connected via socket:', socket.id, 'User:', socket.user.email);

    socket.on('join_event', async (eventId) => {
        socket.join(eventId);
        socket.currentEventId = eventId;
        console.log(`Socket ${socket.id} joined event room: ${eventId}`);

        // Determine role in this event
        const event = await Event.findById(eventId).select('organizerId coordinators');
        let role = 'attendee';
        if (event) {
            if (event.organizerId.toString() === socket.user._id.toString()) {
                role = 'organizer';
            } else if (event.coordinators && event.coordinators.some(c => c.userId.toString() === socket.user._id.toString())) {
                role = 'volunteer';
            }
        }
        socket.eventRole = role;

        // Add to presence map
        if (!eventPresence.has(eventId)) eventPresence.set(eventId, new Map());
        eventPresence.get(eventId).set(socket.user._id.toString(), {
            userId: socket.user._id.toString(),
            name: socket.user.name,
            role,
            socketId: socket.id
        });

        // Emit full presence list to all in room
        const presentUsers = Array.from(eventPresence.get(eventId).values());
        io.to(eventId).emit('presence_update', presentUsers);
    });
    
    socket.on('join_user', (userId) => {
        socket.join(userId);
        console.log(`Socket ${socket.id} joined personal room: ${userId}`);
    });

    socket.on('send_query', async (data) => {
        try {
            const { eventId, text } = data;
            const userId = socket.user._id;
            const userName = socket.user.name;
            
            const newQuery = new Query({
                eventId,
                user: { id: userId, name: userName },
                text
            });
            await newQuery.save();
            
            // Broadcast to everyone in the room (including sender)
            io.to(eventId).emit('new_query', newQuery);
            
            // Notify organizer
            const event = await Event.findById(eventId);
            if (event && event.organizerId) {
                const notif = new Notification({
                    userId: event.organizerId,
                    title: 'New Event Query',
                    message: `${userName} asked a question about ${event.title}`,
                    type: 'info',
                    link: `/hosted-events/${eventId}/queries`
                });
                await notif.save();
                io.to(event.organizerId.toString()).emit('new_notification', notif);
            }
        } catch (error) {
            console.error('Error saving query:', error);
        }
    });

    socket.on('organizer_reply', async (data) => {
        try {
            const { queryId, eventId, replyText } = data;
            
            const event = await Event.findById(eventId);
            const isOrganizer = event && event.organizerId.toString() === socket.user._id.toString();
            const isCoordinator = event && event.coordinators && event.coordinators.some(c => c.userId.toString() === socket.user._id.toString());
            
            if (!isOrganizer && !isCoordinator) {
                console.error('Unauthorized organizer reply attempt');
                return;
            }

            const updatedQuery = await Query.findByIdAndUpdate(
                queryId, 
                { 
                    $push: { 
                        replies: { sender: 'organizer', text: replyText } 
                    } 
                },
                { new: true }
            );
            
            io.to(eventId).emit('query_resolved', updatedQuery); // reuse the same event for frontend update
            
            // Notify user
            if (event && updatedQuery.user && updatedQuery.user.id) {
                const notif = new Notification({
                    userId: updatedQuery.user.id,
                    title: 'New Reply to Your Query',
                    message: replyText ? `Organizer replied: "${replyText}"` : `The organizer replied to your question about ${event.title}.`,
                    type: 'info',
                    link: `/event/${eventId}`
                });
                await notif.save();
                io.to(updatedQuery.user.id.toString()).emit('new_notification', notif);
            }
        } catch (error) {
            console.error('Error adding reply to query:', error);
        }
    });

    socket.on('attendee_reply', async (data) => {
        try {
            const { queryId, eventId, replyText } = data;
            
            const query = await Query.findById(queryId);
            if (!query || query.user.id.toString() !== socket.user._id.toString()) {
                console.error('Unauthorized attendee reply attempt');
                return;
            }

            const updatedQuery = await Query.findByIdAndUpdate(
                queryId, 
                { 
                    $push: { 
                        replies: { sender: 'attendee', text: replyText } 
                    } 
                },
                { new: true }
            );
            
            io.to(eventId).emit('query_resolved', updatedQuery); // reuse the same event for frontend update
            
            // Notify organizer
            const event = await Event.findById(eventId);
            if (event && event.organizerId) {
                const notif = new Notification({
                    userId: event.organizerId,
                    title: 'New Reply from Attendee',
                    message: `${updatedQuery.user.name} replied: "${replyText}"`,
                    type: 'info',
                    link: `/hosted-events/${eventId}/queries`
                });
                await notif.save();
                io.to(event.organizerId.toString()).emit('new_notification', notif);
            }
        } catch (error) {
            console.error('Error adding attendee reply:', error);
        }
    });

    socket.on('resolve_query', async (data) => {
        try {
            const { queryId, eventId } = data;
            
            const query = await Query.findById(queryId);
            if (!query || query.user.id.toString() !== socket.user._id.toString()) {
                console.error('Unauthorized resolve query attempt');
                return;
            }

            const updatedQuery = await Query.findByIdAndUpdate(
                queryId, 
                { isResolved: true },
                { new: true }
            );
            
            io.to(eventId).emit('query_resolved', updatedQuery);
            
            // Notify organizer that query was closed
            const event = await Event.findById(eventId);
            if (event && event.organizerId) {
                const notif = new Notification({
                    userId: event.organizerId,
                    title: 'Query Closed',
                    message: `${updatedQuery.user.name} closed their query about ${event.title}.`,
                    type: 'success',
                    link: `/hosted-events/${eventId}/queries`
                });
                await notif.save();
                io.to(event.organizerId.toString()).emit('new_notification', notif);
            }
        } catch (error) {
            console.error('Error resolving query:', error);
        }
    });

    socket.on('mark_attendance', async (data) => {
        try {
            const { registrationId, eventId } = data;
            
            const event = await Event.findById(eventId);
            const isOrganizer = event && event.organizerId.toString() === socket.user._id.toString();
            const isCoordinator = event && event.coordinators && event.coordinators.some(c => c.userId.toString() === socket.user._id.toString());
            
            if (!isOrganizer && !isCoordinator) {
                console.error('Unauthorized mark attendance attempt');
                return;
            }

            const updatedRegistration = await Registration.findByIdAndUpdate(
                registrationId,
                { status: 'attended' },
                { new: true }
            );

            if (updatedRegistration) {
                // Broadcast the updated registration to the organizer's room (eventId)
                io.to(eventId).emit('attendance_updated', updatedRegistration);
            }
        } catch (error) {
            console.error('Error marking attendance:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

        // Remove from presence and notify room
        if (socket.currentEventId && eventPresence.has(socket.currentEventId)) {
            eventPresence.get(socket.currentEventId).delete(socket.user._id.toString());
            const presentUsers = Array.from(eventPresence.get(socket.currentEventId).values());
            io.to(socket.currentEventId).emit('presence_update', presentUsers);
        }
    });
});


// Global Error Handler (must be last middleware)
app.use(errorHandler);

// Database Connection
const connectDB = require('./config/db');
connectDB();

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
