const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
require('dotenv').config();

const seedSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eventhub');
        console.log('MongoDB Connected for Seeding');

        // Check if a super admin already exists
        const adminExists = await Admin.findOne({ email: 'admin@campuseventhub.com' });
        if (adminExists) {
            console.log('Super Admin already exists. Exiting...');
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Admin@1234', salt);

        const superAdmin = new Admin({
            name: 'System Super Admin',
            email: 'admin@campuseventhub.com',
            password: hashedPassword,
            isSuperAdmin: true,
            permissions: ['ALL']
        });

        await superAdmin.save();
        console.log('Super Admin created successfully!');
        console.log('Email: admin@campuseventhub.com');
        console.log('Password: Admin@1234');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedSuperAdmin();
