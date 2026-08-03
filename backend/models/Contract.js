const mongoose = require('mongoose');

const contractSchema = mongoose.Schema({
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    employerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    uniqueContractId: { type: String, required: true, unique: true },
    workerName: { type: String, required: true },
    employerName: { type: String, required: true },
    jobTitle: { type: String, required: true },
    workLocation: { type: String, default: 'On-Site' },
    wage: { type: Number, required: true },
    paymentMethod: { type: String, default: 'Cash / Transfer' },
    workerSignature: { type: String, default: null },
    employerSignature: { type: String, default: null },
    status: { type: String, enum: ['pending', 'accepted'], default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

const Contract = mongoose.model('Contract', contractSchema);
module.exports = Contract;
