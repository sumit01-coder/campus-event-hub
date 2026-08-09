const mongoose = require('mongoose');
require('dotenv').config();
const Event = require('../models/Event');
const Registration = require('../models/Registration');

async function syncCounts() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eventhub');
    console.log('MongoDB Connected');

    const events = await Event.find({});
    for (const event of events) {
      const count = await Registration.countDocuments({ eventId: event._id });
      event.registeredCount = count;
      await event.save();
      console.log(`Updated Event ${event.title} with count: ${count}`);
    }

    console.log('All events synced!');
    process.exit(0);
  } catch (error) {
    console.error('Error syncing counts:', error);
    process.exit(1);
  }
}

syncCounts();
