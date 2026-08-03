const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: { type: String }, // Made optional for OTP first stage
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['worker', 'employer', 'coordinator', 'pending'], default: 'pending' },

    // Worker fields
    primarySkill: { type: String },
    secondarySkills: [{ type: String }],
    wageExpectation: { type: Number },
    workRadius: { type: Number, default: 5 },

    // Employer fields
    employerType: { type: String, enum: ['Individual', 'Contractor'] },

    // Coordinator fields
    managedZones: [{ type: String }],


    skills: [{
        name: { type: String, required: true },
        experience: { type: Number, min: 0, default: 0 },
        rating: { type: Number, default: 0 }
    }],
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] }
    },
    locationName: { type: String },
    availability: { type: Boolean, default: true },
    rating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },

    profileCompleted: { type: Boolean, default: false },
    signature: {
        signedBy: { type: String },
        timestamp: { type: Date },
        hashId: { type: String, unique: true, sparse: true }
    }
}, { timestamps: true });

userSchema.index({ location: '2dsphere' });
userSchema.index({ "skills.name": 1 });

module.exports = mongoose.model('User', userSchema);
