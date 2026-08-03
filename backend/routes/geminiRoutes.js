const express = require('express');
const router = express.Router();
const { extractVoiceSkills } = require('../controllers/geminiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/extract-skills', protect, extractVoiceSkills);

module.exports = router;
