const express = require('express');
const router = express.Router();
const { getAuditTrail, verifyAuditChain, createAuditEntry } = require('../controllers/auditController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/',        getAuditTrail);
router.get('/verify',  verifyAuditChain);
router.post('/',       restrictTo('admin'), createAuditEntry);

module.exports = router;
