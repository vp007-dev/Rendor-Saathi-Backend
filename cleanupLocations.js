// File: backend/cleanupLocations.js
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User'); // Make sure this path is correct

const MONGO_URI = process.env.MONGO_URI;

const forceCleanup = async () => {
    if (!MONGO_URI) {
        console.error('❌ MONGO_URI not found in .env file.');
        process.exit(1);
    }

    try {
        console.log('Connecting to database...');
        await mongoose.connect(MONGO_URI);
        console.log('✅ Database connected.');

        console.log('Forcefully checking and cleaning location data for ALL users...');

        const allUsers = await User.find({});
        let fixedCount = 0;

        if (allUsers.length === 0) {
            console.log('No users found in the database.');
            await mongoose.disconnect();
            process.exit(0);
        }

        console.log(`Found ${allUsers.length} total users. Checking each one...`);

        for (const user of allUsers) {
            let needsFix = false;
            // Check for any possible form of bad or incomplete location data
            if (!user.location || !user.location.coordinates || !Array.isArray(user.location.coordinates) || user.location.coordinates.length !== 2) {
                needsFix = true;
            }

            if (needsFix) {
                console.log(`- Fixing user: ${user.name || user.email} (${user._id})`);
                user.location = {
                    type: 'Point',
                    coordinates: [0, 0] // Set default, valid coordinates
                };
                await user.save();
                fixedCount++;
            }
        }

        if (fixedCount > 0) {
            console.log(`\n✅ Force cleanup complete. Fixed ${fixedCount} user(s).`);
        } else {
            console.log('\n✅ All users already have valid location data.');
        }
        
    } catch (error) {
        console.error('❌ An error occurred during the cleanup process:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from database.');
        process.exit(0);
    }
};

forceCleanup();
