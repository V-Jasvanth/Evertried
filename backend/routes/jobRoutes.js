const express = require('express');
const router = express.Router();
const { createJobAndMatch, getMatchedWorkers } = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

// Define routes
router.post('/create', protect, createJobAndMatch);
router.get('/:jobId/matched-workers', protect, getMatchedWorkers);

module.exports = router;
