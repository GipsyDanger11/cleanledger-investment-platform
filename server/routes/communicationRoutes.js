const express = require('express');
const router  = express.Router({ mergeParams: true });
const ctrl    = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

// ── Q&A ──────────────────────────────────────────────────
router.get( '/startups/:id/qa',              ctrl.listQA);
router.post('/startups/:id/qa',    protect,  ctrl.askQuestion);
router.post('/startups/:id/qa/:qid/answer', protect, ctrl.answerQuestion);

// ── Announcements ────────────────────────────────────────
router.get( '/startups/:id/announcements',           ctrl.listAnnouncements);
router.post('/startups/:id/announcements', protect,  ctrl.postAnnouncement);

// ── Milestone Comments ───────────────────────────────────
router.get( '/startups/:id/milestones/:mid/comments',          ctrl.listMilestoneComments);
router.post('/startups/:id/milestones/:mid/comments', protect, ctrl.postMilestoneComment);

// ── Notifications ────────────────────────────────────────
router.get(   '/notifications',           protect, ctrl.getNotifications);
router.patch( '/notifications/read-all',  protect, ctrl.markAllRead);
router.patch( '/notifications/:id/read',  protect, ctrl.markRead);

module.exports = router;
