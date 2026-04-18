const express = require('express');
const router = express.Router();
const { getSummary, getActiveInvestments, getNotifications } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/summary',             getSummary);
router.get('/active-investments',  getActiveInvestments);
router.get('/notifications',       getNotifications);

module.exports = router;
