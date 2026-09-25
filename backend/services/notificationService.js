const Notification = require('../models/Notification');

/**
 * Creates a persistent notification in MongoDB and emits it via Socket.IO if recipient is online.
 * 
 * @param {Object} params
 * @param {string|ObjectId} params.recipient - ID of the notification recipient
 * @param {string|ObjectId} [params.sender] - ID of the user triggering the action
 * @param {string} params.type - Enum notification type (e.g., JOB_CREATED, JOB_APPLICATION)
 * @param {string} params.title - Notification title
 * @param {string} params.message - Notification message body
 * @param {string|ObjectId} [params.job] - Related Job ID
 * @param {Object} [io] - Socket.IO server instance
 */
const createNotification = async ({ recipient, sender, type, title, message, job }, io = null) => {
    try {
        if (!recipient) {
            console.error('Notification creation failed: recipient is required');
            return null;
        }

        const notification = await Notification.create({
            recipient,
            sender: sender || null,
            type,
            title,
            message,
            job: job || null,
            read: false
        });

        // Populate references for rich client payload
        await notification.populate([
            { path: 'sender', select: 'name email role' },
            { path: 'job', select: 'title pay status' }
        ]);

        // Emit real-time socket event if Socket.IO instance is provided
        if (io) {
            const recipientRoom = `user:${recipient.toString()}`;
            io.to(recipientRoom).emit('notification:new', notification);
        }

        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
};

module.exports = {
    createNotification
};
