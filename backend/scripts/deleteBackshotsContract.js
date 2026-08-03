/**
 * One-off script: deletes all contracts and jobs with jobTitle "Backshots"
 * Run from backend/: node scripts/deleteBackshotsContract.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Contract = require('../models/Contract');
const Job = require('../models/Job');

(async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Delete contracts with jobTitle "Backshots" (case-insensitive)
        const contractResult = await Contract.deleteMany({
            jobTitle: { $regex: /^backshots$/i }
        });
        console.log(`🗑️  Deleted ${contractResult.deletedCount} contract(s) with jobTitle "Backshots"`);

        // Also delete the job itself so it doesn't re-appear
        const jobResult = await Job.deleteMany({
            title: { $regex: /^backshots$/i }
        });
        console.log(`🗑️  Deleted ${jobResult.deletedCount} job(s) with title "Backshots"`);

        console.log('✅ Done. Disconnecting...');
        await mongoose.disconnect();
    } catch (err) {
        console.error('❌ Error:', err.message);
        process.exit(1);
    }
})();
