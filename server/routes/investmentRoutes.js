const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Investment = require('../models/Investment');

// GET /api/v1/investments — user's investments
router.get('/', protect, async (req, res, next) => {
  try {
    const investments = await Investment.find({ investor: req.user._id })
      .populate('startup', 'name sector geography trustScore esgScore verificationStatus fundingTarget totalRaised')
      .sort({ date: -1 })
      .lean();
    res.json({ success: true, count: investments.length, data: investments });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
