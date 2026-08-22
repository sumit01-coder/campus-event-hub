const cron = require('node-cron');
const Event = require('../models/Event');
const Registration = require('../models/Registration');
const { sendReminderEmail } = require('../services/emailService');

// Schedule tasks to be run on the server.
// Runs every hour on the hour '0 * * * *'
cron.schedule('0 * * * *', async () => {
    console.log('Running daily event reminder check...');
    try {
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
        
        // Find events starting within the next 24-25 hours to ensure we catch them exactly once
        const nextHour = new Date(tomorrow.getTime() + 60 * 60 * 1000);

        const upcomingEvents = await Event.find({
            date: {
                $gte: tomorrow,
                $lt: nextHour
            }
        });

        for (const event of upcomingEvents) {
            console.log(`Sending reminders for event: ${event.title}`);
            const registrations = await Registration.find({ eventId: event._id, status: 'registered' });
            
            for (const reg of registrations) {
                if (reg.email) {
                    try {
                        await sendReminderEmail(reg.email, reg.participantName, event);
                    } catch (err) {
                        console.error(`Failed to send reminder email to ${reg.email}`);
                    }
                }
                if (reg.phone) {
                    // SIMULATED WHATSAPP REMINDER
                    console.log(`[WHATSAPP SIMULATION] Sending Reminder for ${event.title} to +${reg.phone}`);
                }
            }
        }
    } catch (error) {
        console.error('Error running reminder cron job:', error);
    }
});

console.log('Reminder cron job initialized.');
