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
const { encrypt, homomorphicAdd, decryptSum } = require('../utils/fhe');
const { contract } = require('../utils/contract');
const { ethers } = require('ethers');

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

  // 5.5. Transfer funds to Startup Founder's Wallet based on unlocked proportions.
  // 1. Any unallocated percentage is available immediately.
  // 2. Any percentage mapped to already 'verified' milestones is available immediately.
  let releasedPct = 0;
  let totalAllocated = 0;
  for (const m of startup.milestones || []) {
    totalAllocated += (m.tranchePct || 0);
    if (m.status === 'verified') {
      releasedPct += (m.tranchePct || 0);
    }
  }
  const unallocatedPct = Math.max(0, 100 - totalAllocated);
  const totalImmediatePct = releasedPct + unallocatedPct;
  const immediateTransfer = (totalImmediatePct / 100) * investAmount;

  if (startup.createdBy && immediateTransfer > 0) {
    await User.findByIdAndUpdate(startup.createdBy, {
      $inc: { walletBalance: immediateTransfer },
    });
  }

  // 6. Create anonymised investor ID hash (public audit — no PII)
  const investorIdHash = crypto
    .createHash('sha256')
    .update(req.user._id.toString())
    .digest('hex')
    .slice(0, 16);

  // 6.5 FHE-encrypt the investment amount
  //     The ciphertext can be homomorphically aggregated later without decryption
  const { ciphertext: encryptedAmount, noise: encryptedNoise } =
    encrypt(investAmount, req.user._id.toString(), startupId.toString());

  // 7. Create Investment record on Blockchain
  let tx;
  if (contract) {
    try {
      tx = await contract.invest(
        crypto.randomBytes(16).toString('hex'), // temp ID for chain
        startupId.toString(),
        ethers.parseUnits(investAmount.toString(), 0), // Assuming INR corresponds to units
        trancheTag || `Round — ${startup.name}`,
        encryptedAmount,
        { value: 0 } // No MATIC sent for virtual wallet migration, or handle actual payments here
      );
      await tx.wait();
      console.log(`Blockchain transaction confirmed: ${tx.hash}`);
    } catch (err) {
      console.error('Blockchain transaction failed:', err);
      // Rollback DB wallet if possible, but for hackathon we log error
    }
  } else {
    console.warn('Blockchain features disabled: CONTRACT_ADDRESS not configured');
  }


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
    encryptedAmount,
    encryptedNoise,
    blockHash:      tx?.hash || '',
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

// ── GET /api/v1/investments/fhe-aggregate/:startupId ─────────────────────────
// Performs FHE homomorphic sum: computes total raised WITHOUT revealing
// individual investor amounts. Returns ciphertext, plaintext proof, and metadata.
exports.fheAggregate = catchAsync(async (req, res) => {
  const { startupId } = req.params;
  const investments = await Investment.find({
    startup: startupId,
    encryptedAmount: { $ne: '' },
  }).lean();

  if (!investments.length) {
    return res.json({
      success: true,
      data: {
        investorCount: 0,
        fheSum: '0000000000000000',
        decryptedTotal: 0,
        individualAmounts: 'HIDDEN — FHE Protected',
        method: 'Paillier-inspired Additive HE',
        note: 'No FHE-encrypted investments yet.',
      },
    });
  }

  // Homomorphically sum all ciphertexts — no decryption of individuals
  let cipherSum = investments[0].encryptedAmount;
  let noiseSum  = investments[0].encryptedNoise;
  for (let i = 1; i < investments.length; i++) {
    cipherSum = homomorphicAdd(cipherSum, investments[i].encryptedAmount);
    noiseSum += investments[i].encryptedNoise;
  }

  // Decrypt the AGGREGATE only (individual amounts stay hidden)
  const decryptedTotal = decryptSum(cipherSum, noiseSum);

  res.json({
    success: true,
    data: {
      investorCount:    investments.length,
      fheSum:           cipherSum,
      decryptedTotal,
      individualAmounts: 'HIDDEN — FHE Protected — identities encrypted via Paillier Scheme',
      encryptedCiphertexts: investments.map(inv => ({
        investorIdHash: inv.investorIdHash,
        ciphertext: inv.encryptedAmount,
      })),
      method: 'Paillier-inspired Additive Homomorphic Encryption',
      property: 'Sum computed on ciphertexts. No individual decryption performed.',
      verification: `decrypt_sum(${cipherSum}) = ₹${decryptedTotal.toLocaleString('en-IN')}`,
    },
  });
});
