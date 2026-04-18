const AuditEntry = require('../models/AuditEntry');
const { verifyChain }   = require('../utils/verifyChain');
const { createBlock }   = require('../utils/blockchain');
const { computeHash: legacyHash, nextBlockNumber } = require('../services/hashService');

// @desc    Get paginated audit trail
// @route   GET /api/v1/audit
// @access  Private
const getAuditTrail = async (req, res, next) => {
  try {
    const { type, startup, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (type && type !== 'all')    filter.type    = type;
    if (startup && startup !== 'all') filter.startup = startup;
    if (search) {
      filter.$or = [
        { fromEntity: new RegExp(search, 'i') },
        { toEntity:   new RegExp(search, 'i') },
        { hash:       new RegExp(search, 'i') },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [entries, total] = await Promise.all([
      AuditEntry.find(filter)
        .sort({ blockNumber: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('startup', 'name')
        .populate('initiatedBy', 'name'),
      AuditEntry.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: entries,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Verify the integrity of the audit chain
// @route   GET /api/v1/audit/verify
// @access  Private
const verifyAuditChain = async (req, res, next) => {
  try {
    // Use our canonical SHA-256 recomputation verifier (detects data tampering)
    const result = await verifyChain();
    res.json({
      success: true,
      data: {
        valid:        result.valid,
        brokenAt:     result.brokenAt,
        brokenType:   result.brokenType   || null,
        message:      result.message      || null,
        total:        result.total,
        checkedAt:    result.checkedAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create an audit entry (internal/admin)
// @route   POST /api/v1/audit
// @access  Private/Admin
const createAuditEntry = async (req, res, next) => {
  try {
    // Route through canonical createBlock for correct chain formula
    const { type, fromEntity, toEntity, amount, currency, metadata, startup } = req.body;
    const block = await createBlock({
      type, fromEntity, toEntity,
      amount:      amount   || 0,
      currency:    currency || 'INR',
      metadata:    metadata || {},
      startupId:   startup  || undefined,
      initiatedBy: req.user._id,
    });
    res.status(201).json({ success: true, data: block });
  } catch (err) {
    next(err);
  }
};

// @desc    Simulate data tampering for demo/hackathon
// @route   POST /api/v1/audit/simulate-tamper
// @access  Private
const simulateTamper = async (req, res, next) => {
  try {
    const { blockNumber } = req.body;
    let query = {};
    if (blockNumber) query.blockNumber = blockNumber;
    else query.amount = { $gt: 0 }; // find any block with a money amount

    // Find the block
    const block = await AuditEntry.findOne(query).sort({ blockNumber: -1 });
    if (!block) return res.status(404).json({ success: false, message: 'No block found to tamper.' });

    // Use pure MongoDB driver to bypass Mongoose's immutable pre-hook
    await AuditEntry.collection.updateOne(
      { _id: block._id },
      { $inc: { amount: 50000 } } // Subtly tamper the amount by adding 50k
    );

    res.json({
      success: true,
      message: `Successfully tampered Block #${block.blockNumber} (added ₹50,000 to amount). Run "Verify Chain" to detect the anomaly.`,
      tamperedBlockNumber: block.blockNumber
    });
  } catch (err) {
    console.error('Tamper error:', err);
    next(err);
  }
};

module.exports = {
  getAuditTrail,
  verifyAuditChain,
  createAuditEntry,
  simulateTamper,
};
