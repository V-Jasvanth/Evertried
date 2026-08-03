const express = require('express');
const router = express.Router();
const { createJobAndMatch, getMatchedWorkers } = require('../controllers/jobController');

// Define routes
router.post('/create', createJobAndMatch);
router.get('/:jobId/matched-workers', getMatchedWorkers);

module.exports = router;
