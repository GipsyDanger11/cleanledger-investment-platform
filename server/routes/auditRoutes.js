const express = require('express');
const router = express.Router();
const { getAuditTrail, verifyAuditChain, createAuditEntry, simulateTamper } = require('../controllers/auditController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/',        getAuditTrail);
router.get('/verify',  verifyAuditChain);
router.post('/',       restrictTo('admin'), createAuditEntry);
router.post('/simulate-tamper', simulateTamper);

module.exports = router;
