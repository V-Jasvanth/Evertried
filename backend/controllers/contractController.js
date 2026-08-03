const Contract = require('../models/Contract');
const User = require('../models/User');
const Job = require('../models/Job');
const crypto = require('crypto');

// @desc    Generate a new digital contract
// @route   POST /api/contract/generate-contract
// @access  Protected
const generateContract = async (req, res) => {
    try {
        const { jobId, workerId } = req.body;
        const employerId = req.user._id;

        const job = await Job.findById(jobId);
        const worker = await User.findById(workerId);
        const employer = await User.findById(employerId);

        if (!job || !worker || !employer) {
            return res.status(404).json({ message: 'Validation failed, missing entities' });
        }

        // Generate unique hash ID for the contract
        const uniqueContractId = crypto.randomBytes(8).toString('hex').toUpperCase();

        const contract = new Contract({
            jobId,
            workerId,
            employerId,
            uniqueContractId,
            workerName: worker.name,
            employerName: employer.name,
            jobTitle: job.title,
            wage: job.pay || 500,
            employerSignature: employer.signature?.hashId || null // auto-attach if employer has it
        });

        await contract.save();
        res.status(201).json(contract);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to generate contract' });
    }
};

// @desc    Get contract by ID
// @route   GET /api/contract/:id
// @access  Protected
const getContract = async (req, res) => {
    try {
        const contract = await Contract.findById(req.params.id);
        if (!contract) return res.status(404).json({ message: 'Contract not found' });
        res.json(contract);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch contract' });
    }
};

// @desc    Sign contract
// @route   POST /api/contract/:id/sign
// @access  Protected
const signContract = async (req, res) => {
    try {
        const contract = await Contract.findById(req.params.id);
        if (!contract) return res.status(404).json({ message: 'Contract not found' });

        const user = await User.findById(req.user._id);

        if (req.user._id.toString() === contract.workerId.toString()) {
            contract.workerSignature = user.signature?.hashId || 'SIGNED_W_' + Date.now();
        } else if (req.user._id.toString() === contract.employerId.toString()) {
            contract.employerSignature = user.signature?.hashId || 'SIGNED_E_' + Date.now();
        } else {
            return res.status(403).json({ message: 'Unauthorized signing attempt' });
        }

        if (contract.workerSignature && contract.employerSignature) {
            contract.status = 'accepted';
        }

        await contract.save();
        res.json(contract);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to sign contract' });
    }
};

module.exports = { generateContract, getContract, signContract };
