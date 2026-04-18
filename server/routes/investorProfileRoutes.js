const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const ctrl = require('../controllers/investorProfileController');

router.get('/me', protect, restrictTo('investor'), ctrl.getMy);
router.put('/me', protect, restrictTo('investor'), ctrl.putMy);

module.exports = router;
