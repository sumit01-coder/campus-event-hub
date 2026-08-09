const mongoose = require('mongoose');
const Event = require('./models/Event');

mongoose.connect('mongodb://127.0.0.1:27017/eventhub')
    .then(async () => {
        await Event.updateOne(
            { _id: '6a781ab62bf4942ca5ef0b2f' },
            { $set: { participationType: 'both', maxGroupSize: 4 } }
        );
        console.log('Event successfully updated to allow groups!');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
