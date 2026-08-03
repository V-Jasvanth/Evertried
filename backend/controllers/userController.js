const User = require('../models/User');

// @desc    Update worker skills
// @route   POST /api/users/update-skills
// @access  Public (Will be protected later)
const updateSkills = async (req, res) => {
    try {
        const { userId, skills } = req.body;

        if (!userId || !skills) {
            return res.status(400).json({ message: 'User ID and skills are required' });
        }

        // Must limit to 10 skills based on instructions
        if (skills.length > 10) {
            return res.status(400).json({ message: 'Maximum 10 skills allowed per worker' });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role !== 'worker') {
            return res.status(400).json({ message: 'Only workers can update skills' });
        }

        user.skills = skills;
        await user.save();

        res.json({ message: 'Skills updated successfully', skills: user.skills });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating skills' });
    }
};

// @desc    Complete job and update rating
// @route   POST /api/users/complete-job
// @access  Public (Will be protected later)
const completeJob = async (req, res) => {
    try {
        const { workerId, rating } = req.body;

        if (!workerId || rating === undefined) {
            return res.status(400).json({ message: 'Worker ID and rating are required' });
        }

        const worker = await User.findById(workerId);

        if (!worker) {
            return res.status(404).json({ message: 'Worker not found' });
        }

        // Update average rating using mathematically correct formula
        worker.rating = ((worker.rating || 0) * (worker.ratingCount || 0) + rating) / ((worker.ratingCount || 0) + 1);
        worker.ratingCount = (worker.ratingCount || 0) + 1;
        await worker.save();

        res.json({ message: 'Job completed & rating updated', rating: worker.rating });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error completing job' });
    }
};

// @desc    Update user profile during onboarding
// @route   PUT /api/user/profile
// @access  Protected
const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id; // Extracted from auth middleware
        const {
            name, role, primarySkill, secondarySkills, wageExpectation, workRadius,
            employerType, locationCoordinates, locationName, availability
        } = req.body;

        const user = await User.findById(userId);
        if(!user) return res.status(404).json({ message: 'User not found' });

        if(name) user.name = name;
        if(role && user.role === 'pending') user.role = role;
        
        if(user.role === 'worker') {
            if(primarySkill) user.primarySkill = primarySkill;
            if(secondarySkills) user.secondarySkills = secondarySkills;
            if(wageExpectation) user.wageExpectation = wageExpectation;
            if(workRadius) user.workRadius = workRadius;
        } else if(user.role === 'employer') {
            if(employerType) user.employerType = employerType;
        }

        if(locationCoordinates) {
            user.location = { type: 'Point', coordinates: locationCoordinates };
        }
        if(locationName) user.locationName = locationName;
        if(availability !== undefined) user.availability = availability;

        user.profileCompleted = true; // Mark onboarding as done!
        
        await user.save();

        res.json({
            _id: user._id, name: user.name, email: user.email, role: user.role,
            profileCompleted: user.profileCompleted
        });
    } catch(error) {
        console.error(error);
        res.status(500).json({ message: 'Server error updating profile' });
    }
};

// @desc    Create Digital Signature
// @route   POST /api/user/create-signature
// @access  Protected
const createSignature = async (req, res) => {
    try {
        const { fullName } = req.body;
        if (!fullName) return res.status(400).json({ message: 'Full name is required' });

        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ message: 'User not found' });

        const timestamp = new Date();
        const crypto = require('crypto');
        const hashId = crypto.createHash('sha256').update(`${userId}-${fullName}-${timestamp.getTime()}`).digest('hex').substring(0, 16);

        user.signature = {
            signedBy: fullName,
            timestamp: timestamp,
            hashId: hashId
        };

        await user.save();

        res.json({ message: 'Signature created successfully', signature: user.signature });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error creating signature' });
    }
};

// @desc    Get Digital Signature
// @route   GET /api/user/get-signature
// @access  Protected
const getSignature = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.signature || !user.signature.hashId) {
            return res.status(404).json({ message: 'Signature not found' });
        }

        res.json({ signature: user.signature });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving signature' });
    }
};

// @desc    Get user profile details
// @route   GET /api/user/profile
// @access  Protected
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error retrieving profile' });
    }
};

module.exports = {
    updateSkills,
    completeJob,
    updateProfile,
    getProfile,
    createSignature,
    getSignature
};
