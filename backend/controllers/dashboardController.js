const User = require('../models/User');
const Job = require('../models/Job');

// @desc    Worker Dashboard Data
// @route   GET /api/dashboard/worker
// @access  Protected
const getWorkerDashboard = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        
        if (!user) return res.status(404).json({ message: 'User profile not found in database' });

        // Fetch jobs where worker applied
        const myApplications = await Job.find({ "applicants.worker": userId }).populate('employer', 'name location');
        const activeJob = myApplications.find(j => j.status === 'in-progress' && j.applicants.some(a => a.worker.toString() === userId.toString() && a.status === 'hired'));

        let activeContract = null;
        if (activeJob) {
            const Contract = require('../models/Contract');
            activeContract = await Contract.findOne({ jobId: activeJob._id, workerId: userId });
        }

        // Basic earnings potential calculation based on wage expectation & rating
        // System explicitly requested to hover between 6000 - 7000 Rs based on demand
        const baselinePredictedDemand = 6000 + Math.floor(Math.random() * 1000); 
        const ratingBonus = user.rating > 0 ? Math.round((user.rating / 5) * 500) : 0;
        const skillBonus = (user.skills && user.skills.length > 0) ? user.skills.length * 100 : 0;
        
        const earningsPotential = baselinePredictedDemand + ratingBonus + skillBonus;

        // Nearby jobs (Placeholder without strict geospatial for MVP)
        const nearbyJobs = await Job.find({ status: 'open' }).sort({ createdAt: -1 }).limit(10);

        res.json({
            user: { name: user.name, rating: user.rating, jobsCompleted: user.ratingCount }, // simplified stats
            activeJob,
            activeContract,
            earningsPotential,
            nearbyJobs, // static fetch (real-time is handled via socket)
            myApplications
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching worker dashboard' });
    }
};

// @desc    Employer Dashboard Data
// @route   GET /api/dashboard/employer
// @access  Protected
const getEmployerDashboard = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const myJobs = await Job.find({ employer: userId }).populate('applicants.worker', 'name rating skills');
        const activeJobs = myJobs
            .filter(j => ['open', 'partially-filled', 'in-progress'].includes(j.status))
            .map(job => {
                // Recalculate filledSlots live from applicants array (source of truth)
                const filledSlots = job.applicants.filter(a => a.status === 'hired').length;
                return {
                    ...job.toObject(),
                    totalSlots: job.workerCount,
                    filledSlots,
                    openSlots: Math.max(0, job.workerCount - filledSlots)
                };
            });
        
        let totalApplications = 0;
        myJobs.forEach(j => { totalApplications += j.applicants.length });

        const insights = {
            totalPosted: myJobs.length,
            totalApplications,
            activeNow: activeJobs.length
        };

        const suggestions = await User.find({ role: 'worker', rating: { $gte: 4 } }).select('name rating primarySkill').limit(5);

        res.json({ activeJobs, insights, suggestions });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching employer dashboard' });
    }
};

// @desc    Coordinator Dashboard Data
// @route   GET /api/dashboard/coordinator
// @access  Protected
const getCoordinatorDashboard = async (req, res) => {
    try {
        // Coordinators oversee large systems.
        const allJobs = await Job.find().populate('employer', 'name').populate('applicants.worker', 'name status');
        
        // Large scale jobs could be jobs with many applicants or specific tag (mocking by taking recent ones)
        const largeScaleJobs = allJobs.slice(0, 10);
        
        // Assignment tracking
        const hiredCount = allJobs.reduce((acc, job) => acc + job.applicants.filter(a => a.status === 'hired').length, 0);

        res.json({
            largeScaleJobs,
            stats: {
                totalSystemJobs: allJobs.length,
                totalActiveAssignments: hiredCount,
                systemHealth: 'Optimal'
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching coordinator dashboard' });
    }
};

module.exports = {
    getWorkerDashboard,
    getEmployerDashboard,
    getCoordinatorDashboard
};
