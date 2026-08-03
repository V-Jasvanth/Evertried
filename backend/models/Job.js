const mongoose = require('mongoose');

const jobSchema = mongoose.Schema({
    employer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    requiredSkills: [{
        type: String,
        required: true
    }],
    workerCount: {
        type: Number,
        required: true,
        min: 1
    },
    jobType: {
        type: String,
        enum: ['Small', 'Large'],
        default: 'Small'
    },
    pay: {
        type: Number,
        default: 500
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    },
    filledSlots: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['open', 'partially-filled', 'in-progress', 'completed', 'cancelled'],
        default: 'open'
    },
    applicants: [{
        worker: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['applied', 'hired', 'rejected'], default: 'applied' }
    }]
}, {
    timestamps: true
});

// Index location for finding nearby jobs
jobSchema.index({ location: '2dsphere' });

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
