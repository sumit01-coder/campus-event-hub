const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/eventhub').then(async () => {
    const Event = require('../models/Event');
    const result = await Event.updateMany({ price: { $gt: 0 } }, { $set: { isPaid: true } });
    console.log('Fixed', result.modifiedCount, 'events');
    process.exit(0);
});
