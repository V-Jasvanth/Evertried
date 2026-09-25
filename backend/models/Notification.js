const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        type: {
            type: String,
            required: true,
            enum: [
                'JOB_CREATED',
                'JOB_APPLICATION',
                'APPLICATION_ACCEPTED',
                'APPLICATION_REJECTED',
                'JOB_STARTED',
                'JOB_COMPLETED',
                'RATING_REQUESTED',
                'JOB_CANCELLED',
                'SYSTEM'
            ]
        },
        title: {
            type: String,
            required: true
        },
        message: {
            type: String,
            required: true
        },
        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Job',
            default: null
        },
        read: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model('Notification', notificationSchema);
