/**
 * walletController.js — Virtual wallet balance endpoint
 * GET /api/v1/investments/wallet
 * POST /api/v1/investments/wallet/topup
 */

const User = require('../models/User');

const apiError = (res, status, msg) => res.status(status).json({ success: false, message: msg });

const catchAsync = fn => (req, res, next) => fn(req, res, next).catch(next);

// ── GET /api/v1/wallet ───────────────────────────────────────────────────────
exports.getWallet = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id).select('walletBalance role name').lean();
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

  res.json({
    success: true,
    data: {
      walletBalance: user.walletBalance ?? 100000,
      currency:      'INR',
      symbol:        '₹',
      role:          user.role,
      // formatted string for quick display
      formatted:     `₹${(user.walletBalance ?? 100000).toLocaleString('en-IN')}`,
    },
  });
});

// ── POST /api/v1/investments/wallet/topup ────────────────────────────────────
exports.topUpWallet = catchAsync(async (req, res) => {
  const { amount } = req.body;
  const topUpAmount = Number(amount);
  if (!topUpAmount || topUpAmount <= 0) {
    return apiError(res, 400, 'Invalid top-up amount.');
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { $inc: { walletBalance: topUpAmount } },
    { new: true }
  );

  res.json({
    success: true,
    message: `Successfully topped up ₹${topUpAmount.toLocaleString('en-IN')}`,
    data: {
      walletBalance: updatedUser.walletBalance,
      currency:      'INR',
      formatted:     `₹${updatedUser.walletBalance.toLocaleString('en-IN')}`,
    },
  });
});
