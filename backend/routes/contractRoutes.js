const express = require('express');
const router = express.Router();
const { generateContract, getContract, signContract } = require('../controllers/contractController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate-contract', protect, generateContract);
router.get('/:id', protect, getContract);
router.post('/:id/sign', protect, signContract);

module.exports = router;
