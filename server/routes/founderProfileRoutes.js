const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/founderProfileController');

router.get('/me', protect, restrictTo('startup', 'founder'), ctrl.getMy);
router.put('/me', protect, restrictTo('startup', 'founder'), ctrl.putMy);

module.exports = router;
