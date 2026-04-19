/**
 * auditVerifyController.js — SHA-256 chain integrity verification
 * GET /api/v1/audit/verify
 */

const { verifyChain } = require('../utils/verifyChain');

const catchAsync = fn => (req, res, next) => fn(req, res, next).catch(next);

exports.verifyIntegrity = catchAsync(async (req, res) => {
  const result = await verifyChain();
  res.json({ success: true, data: result });
});
