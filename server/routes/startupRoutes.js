const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/startupController');
const { protect } = require('../middleware/authMiddleware');

// ── Public routes ─────────────────────────────────────────
router.get('/',          ctrl.listStartups);
router.get('/:id',       ctrl.getStartup);

// ── R3: Milestone timeline (public) ──────────────────────
router.get('/:id/milestones', ctrl.getMilestones);

// ── Protected routes ──────────────────────────────────────
router.use(protect);

// R1 — Profile management
router.post('/',                       ctrl.createStartup);
router.patch('/:id',                   ctrl.updateStartup);
router.get('/me/profile',              ctrl.getMyStartup);
router.patch('/:id/verification',      ctrl.updateVerificationStatus);

// R2 — Fund tracking
router.get('/:id/funds',               ctrl.getFundDashboard);
router.patch('/:id/funds/plan',        ctrl.setFundPlan);
router.post('/:id/funds/expense',      ctrl.addExpense);
router.get('/:id/funds/variance',      ctrl.getVarianceAlerts);

// R3 — Milestones
router.post('/:id/milestones',                      ctrl.createMilestone);
router.patch('/:id/milestones/:mid',                ctrl.updateMilestoneStatus);
router.post('/:id/milestones/:mid/submit',          ctrl.submitMilestoneProof);
router.post('/:id/milestones/:mid/vote',            ctrl.castVote);
router.post('/admin/check-missed',                  ctrl.checkMissedMilestones);

module.exports = router;
