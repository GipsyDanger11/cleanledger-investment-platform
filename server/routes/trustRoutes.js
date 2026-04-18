const express = require('express');
const router  = express.Router();
const trust   = require('../controllers/trustController');
const { protect } = require('../middleware/authMiddleware');

// R4 — Trust Score
router.get('/:id/trust-score',                    trust.getTrustScore);
router.get('/:id/trust-history',                  trust.getTrustHistory);
router.post('/:id/compute-trust-score', protect,  trust.computeTrustScore);
router.patch('/:id/pitch-quality',      protect,  trust.setPitchQualityScore);

module.exports = router;
