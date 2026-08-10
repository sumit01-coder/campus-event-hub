const mongoose = require('mongoose');
const User = require('../models/User');

const MONGO_URI = 'mongodb://127.0.0.1:27017/eventhub'; 

mongoose.connect(MONGO_URI)
  .then(async () => {
    await User.updateOne({ email: 'amitpatel00784@gmail.com' }, { $set: { 'capabilities.volunteer': true } });
    console.log('Fixed amitpatel00784');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
