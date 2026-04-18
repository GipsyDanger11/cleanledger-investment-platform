/**
 * investmentController.js
 *
 * POST /api/v1/investments  — investor places investment (debits virtual wallet)
 * GET  /api/v1/investments  — list investor's investments (handled in route file)
 */

const crypto     = require('crypto');
const User       = require('../models/User');
const Startup    = require('../models/Startup');
const Investment = require('../models/Investment');
const { createBlock } = require('../utils/blockchain');

const catchAsync = fn => (req, res, next) => fn(req, res, next).catch(next);
const apiError   = (res, status, msg) => res.status(status).json({ success: false, message: msg });

// ── POST /api/v1/investments ─────────────────────────────────────────────────
exports.invest = catchAsync(async (req, res) => {
  // 1. Auth gate — investor role only
  if (req.user.role !== 'investor') {
    return apiError(res, 403, 'Only investors can make investments.');
  }

  const { startupId, amount, trancheTag } = req.body;

  // 2. Validate amount
  const investAmount = Number(amount);
  if (!investAmount || investAmount < 1000) {
    return apiError(res, 400, 'Minimum investment is ₹1,000.');
  }

  // 3. Fetch startup
  const startup = await Startup.findById(startupId);
  if (!startup) return apiError(res, 404, 'Startup not found.');

  // 4. Atomic wallet deduction — use findOneAndUpdate with $inc and condition
  //    so the balance never goes negative even under concurrent requests.
  const updatedUser = await User.findOneAndUpdate(
    { _id: req.user._id, walletBalance: { $gte: investAmount } },
    { $inc: { walletBalance: -investAmount } },
    { new: true }
  );

  if (!updatedUser) {
    return apiError(res, 400, 'Insufficient wallet balance. Top-up your virtual wallet to continue.');
  }

  // 5. Update startup totals
  await Startup.findByIdAndUpdate(startupId, {
    $inc: { totalRaised: investAmount, backers: 1 },
  });

  // 6. Create anonymised investor ID hash (public audit — no PII)
  const investorIdHash = crypto
    .createHash('sha256')
    .update(req.user._id.toString())
    .digest('hex')
    .slice(0, 16);

  // 7. Create Investment record
  const investment = await Investment.create({
    investor:       req.user._id,
    startup:        startupId,
    startupName:    startup.name,
    sector:         startup.sector,
    amount:         investAmount,
    currency:       'INR',
    trancheTag:     trancheTag || `Round — ${startup.name}`,
    investorIdHash,
    trancheStatus:  'Phase 1 — In Progress',
    trustScore:     startup.trustScore || 0,
    status:         'active',
  });

  // 8. Write SHA-256 hash chain block
  const block = await createBlock({
    type:         'investment',
    fromEntity:   updatedUser.name || updatedUser.email,
    toEntity:     startup.name,
    amount:       investAmount,
    currency:     'INR',
    metadata:     {
      investmentId:  investment._id.toString(),
      investorHash:  investorIdHash,
      startupId:     startupId.toString(),
      trancheTag:    investment.trancheTag,
    },
    startupId:    startup._id,
    investmentId: investment._id,
    initiatedBy:  req.user._id,
  });

  // 9. Back-link the block hash to the investment record (no immutability guard on Investment)
  await Investment.findByIdAndUpdate(investment._id, { blockHash: block.hash });

  res.status(201).json({
    success: true,
    message: `Investment of ₹${investAmount.toLocaleString('en-IN')} placed successfully.`,
    data: {
      investment: {
        ...investment.toObject(),
        blockHash: block.hash,
      },
      walletBalance: updatedUser.walletBalance,
      blockNumber:   block.blockNumber,
      blockHash:     block.hash,
    },
  });
});

// ── GET /api/v1/investments ───────────────────────────────────────────────────
exports.listInvestments = catchAsync(async (req, res) => {
  const investments = await Investment.find({ investor: req.user._id })
    .populate('startup', 'name sector geography trustScore esgScore verificationStatus fundingTarget totalRaised')
    .sort({ date: -1 })
    .lean();
  res.json({ success: true, count: investments.length, data: investments });
});
