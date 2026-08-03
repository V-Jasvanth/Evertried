const express = require('express');
const router = express.Router();
const { 
    getWorkerDashboard, 
    getEmployerDashboard, 
    getCoordinatorDashboard 
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.get('/worker', protect, getWorkerDashboard);
router.get('/employer', protect, getEmployerDashboard);
router.get('/coordinator', protect, getCoordinatorDashboard);

module.exports = router;
