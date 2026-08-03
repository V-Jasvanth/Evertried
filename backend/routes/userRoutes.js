const express = require('express');
const router = express.Router();
const { updateSkills, completeJob, updateProfile, getProfile, createSignature, getSignature } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

// Define routes
router.post('/update-skills', updateSkills); // Should be protected later
router.post('/complete-job', completeJob);
router.put('/profile', protect, updateProfile);
router.get('/profile', protect, getProfile);

// Signature routes
router.post('/create-signature', protect, createSignature);
router.get('/get-signature', protect, getSignature);

module.exports = router;
