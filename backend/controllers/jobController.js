const Job = require('../models/Job');
const User = require('../models/User');

// Helper function to rank workers based on instructions
const rankWorkers = (workers) => {
    return workers.sort((a, b) => {
        // Find max experience amongst their skills for a general metric, or average it.
        // Assuming we look at general experience length here, simplified.
        const getExp = w => w.skills.reduce((acc, curr) => acc + curr.experience, 0);

        const scoreB = (b.rating * 0.5) + (b.skills.length * 0.3) + (getExp(b) * 0.2);
        const scoreA = (a.rating * 0.5) + (a.skills.length * 0.3) + (getExp(a) * 0.2);
        
        return scoreB - scoreA;
    });
};

// @desc    Create a new job and find matching workers
// @route   POST /api/jobs/create
// @access  Public (Will be protected later)
const createJobAndMatch = async (req, res) => {
    try {
        const { employer, title, requiredSkills, workerCount, jobType, pay, location } = req.body;

        // 1. Create Job
        const job = new Job({
            employer,
            title,
            requiredSkills,
            workerCount,
            jobType,
            pay,
            location: {
                type: 'Point',
                coordinates: location.coordinates // Expected [lng, lat]
            }
        });

        await job.save();

        // 2. Real-Time Broadcast Engine (Core Logic)
        // Find available workers within 5km who have the required skills
        const maxDistanceInMeters = 5000; // 5 km

        // Populating employer to easily send employer data
        await job.populate('employer', 'name rating');

        let matchedWorkers = await User.find({
            role: 'worker',
            availability: true,
            'skills.name': { $in: requiredSkills },
            location: {
                $near: {
                    $geometry: {
                         type: "Point",
                         coordinates: location.coordinates
                    },
                    $maxDistance: maxDistanceInMeters
                }
            }
        });

        // Rank the workers locally (Ideally use MongoDB Aggregation pipeline for scale)
        const rankedWorkers = rankWorkers(matchedWorkers);

        // 3. Broadcast & SMS to matched connected workers
        const io = req.app.get('io');
        const connectedUsers = req.app.get('connectedUsers');

        let broadcastedCount = 0;
        let smsSentCount = 0;

        rankedWorkers.forEach(worker => {
            // MOCK SMS NOTIFICATION
            console.log(`[SMS Gateway] Sending SMS to ${worker.name}: "New ${jobType} job nearby: ${title} paying ₹${pay}/day! Open EverTried to apply."`);
            smsSentCount++;

            // MOCK PUSH NOTIFICATION / IN_APP UI 
            const socketId = connectedUsers.get(worker._id.toString());
            if (socketId) {
                io.to(socketId).emit('new_job', {
                    id: job._id,
                    title: job.title,
                    employer: job.employer.name,
                    employerId: job.employer._id,
                    location: 'Nearby', // Hardcoded or calculated
                    match: '98%', // Simplified
                    status: 'New',
                    pay: job.pay,
                    jobType: job.jobType
                });
                broadcastedCount++;
            }
        });

        res.status(201).json({
            message: 'Job created and broadcasted',
            job,
            matchingWorkersCount: rankedWorkers.length,
            workersNotified: broadcastedCount,
            smsSent: smsSentCount
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error creating job' });
    }
};

// @desc    Get matched workers for a specific job
// @route   GET /api/jobs/:jobId/matched-workers
// @access  Protected
const getMatchedWorkers = async (req, res) => {
    try {
        const { jobId } = req.params;
        const job = await Job.findById(jobId);
        
        if (!job) return res.status(404).json({ message: 'Job not found' });

        const maxDistanceInMeters = 5000;
        let matchedWorkers = await User.find({
            role: 'worker',
            availability: true,
            'skills.name': { $in: job.requiredSkills },
            location: {
                $near: {
                    $geometry: {
                         type: "Point",
                         coordinates: job.location.coordinates
                    },
                    $maxDistance: maxDistanceInMeters
                }
            }
        }).select('name rating skills profileCompleted');

        const rankedWorkers = rankWorkers(matchedWorkers);

        res.json({
            jobId: job._id,
            matchedWorkers: rankedWorkers
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching matched workers' });
    }
};

module.exports = {
    createJobAndMatch,
    getMatchedWorkers
};
