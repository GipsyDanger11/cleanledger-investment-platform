const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { getAdminDashboard, getFounderDashboard, getInvestorDashboard } = require('../controllers/roleDashboardController');

// Apply authentication to all routes
router.use(protect);

// Admin dashboard – only admin role
router.get('/admin', restrictTo('admin'), getAdminDashboard);

// Founder dashboard – only founder role
router.get('/founder', restrictTo('founder'), getFounderDashboard);

// Investor dashboard – only investor role
router.get('/investor', restrictTo('investor'), getInvestorDashboard);

module.exports = router;
