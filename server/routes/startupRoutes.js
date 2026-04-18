const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/startupController');
const { protect } = require('../middleware/authMiddleware');

// ── Public: list all startups ─────────────────────────────
router.get('/', ctrl.listStartups);

// ── Protected: /me routes MUST come before /:id ──────────
// (otherwise Express matches 'me' as the :id param)
router.get('/me/profile', protect, ctrl.getMyStartup);

// ── Admin — check missed milestones ──────────────────────
router.post('/admin/check-missed', protect, ctrl.checkMissedMilestones);

// ── Public: get single startup + milestones ───────────────
router.get('/:id',            ctrl.getStartup);
router.get('/:id/milestones', ctrl.getMilestones);

// ── Protected: all remaining routes need auth ────────────
router.post('/',                           protect, ctrl.createStartup);
router.patch('/:id',                       protect, ctrl.updateStartup);
router.patch('/:id/verification',          protect, ctrl.updateVerificationStatus);

// R2 — Fund tracking
router.get('/:id/funds',                   protect, ctrl.getFundDashboard);
router.patch('/:id/funds/plan',            protect, ctrl.setFundPlan);
router.post('/:id/funds/expense',          protect, ctrl.addExpense);
router.get('/:id/funds/variance',          protect, ctrl.getVarianceAlerts);

// R3 — Milestones
router.post('/:id/milestones',             protect, ctrl.createMilestone);
router.patch('/:id/milestones/:mid',       protect, ctrl.updateMilestoneStatus);
router.post('/:id/milestones/:mid/submit', protect, ctrl.submitMilestoneProof);
router.post('/:id/milestones/:mid/vote',   protect, ctrl.castVote);

module.exports = router;
