const AuditEntry = require('../models/AuditEntry');
const { computeHash, verifyChain, nextBlockNumber } = require('../services/hashService');

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
    const entries = await AuditEntry.find().sort({ blockNumber: 1 }).lean();
    const { valid, brokenAt } = verifyChain(entries);
    res.json({
      success: true,
      data: {
        valid,
        brokenAt,
        totalEntries: entries.length,
        latestBlock: entries[entries.length - 1]?.blockNumber ?? null,
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
    const lastEntry = await AuditEntry.findOne().sort({ blockNumber: -1 }).lean();
    const previousHash = lastEntry?.hash ?? '0000000000000000000000000000000000000000000000000000000000000000';
    const blockNumber  = nextBlockNumber(lastEntry?.blockNumber ?? null);

    const entryData = { ...req.body, blockNumber, initiatedBy: req.user._id };
    const hash = computeHash(entryData, previousHash);

    const entry = await AuditEntry.create({ ...entryData, hash, previousHash });
    res.status(201).json({ success: true, data: entry });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAuditTrail, verifyAuditChain, createAuditEntry };
