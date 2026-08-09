const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // allow all in dev
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

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
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));
app.use('/api/public', require('./routes/publicRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/registrations', require('./routes/registrationRoutes'));
app.use('/api/queries', require('./routes/queryRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Socket.IO Logic
const Query = require('./models/Query');
const Notification = require('./models/Notification');
const Registration = require('./models/Registration');
const Event = require('./models/Event');

io.on('connection', (socket) => {
    console.log('User connected via socket:', socket.id);

    socket.on('join_event', (eventId) => {
        socket.join(eventId);
        console.log(`Socket ${socket.id} joined event room: ${eventId}`);
    });
    
    socket.on('join_user', (userId) => {
        socket.join(userId);
        console.log(`Socket ${socket.id} joined personal room: ${userId}`);
    });

    socket.on('send_query', async (data) => {
        try {
            const { eventId, userId, userName, text } = data;
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
            const event = await Event.findById(eventId);
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
    });
});


// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eventhub')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('MongoDB Connection Error:', err));

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
