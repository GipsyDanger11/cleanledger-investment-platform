const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { getAdminDashboard, getFounderDashboard, getInvestorDashboard } = require('../controllers/roleDashboardController');

// Apply authentication to all routes
router.use(protect);

// Admin dashboard – only admin role
router.get('/admin', restrictTo('admin'), getAdminDashboard);

// Founder dashboard — `startup` (API) or legacy `founder` role
router.get('/founder', restrictTo('startup', 'founder'), getFounderDashboard);

// Investor dashboard – only investor role
router.get('/investor', restrictTo('investor'), getInvestorDashboard);

module.exports = router;
