const mongoose = require('mongoose');
const Event = require('../models/Event');
const User = require('../models/User');

const MONGO_URI = 'mongodb://127.0.0.1:27017/campuseventhub'; // Adjust if needed

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to DB');
    
    // Find all events with coordinators
    const events = await Event.find({ 'coordinators.0': { $exists: true } });
    const volunteerIds = new Set();
    
    events.forEach(e => {
        e.coordinators.forEach(c => volunteerIds.add(c.userId.toString()));
    });
    
    const ids = Array.from(volunteerIds);
    console.log(`Found ${ids.length} volunteers to migrate.`);
    
    if (ids.length > 0) {
        await User.updateMany(
            { _id: { $in: ids } },
            { $set: { 'capabilities.volunteer': true } }
        );
        console.log('Migration successful.');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
