const Startup = require('../models/Startup');
const { computeTrustScore } = require('../services/trustScoreService');

// @desc    List all verified startups (with filtering)
// @route   GET /api/v1/startups
// @access  Private
const getStartups = async (req, res, next) => {
  try {
    const { sector, minTrust, maxTrust, minEsg, search, page = 1, limit = 12 } = req.query;
    const filter = { verificationStatus: 'verified' };

    if (sector && sector !== 'all') filter.sector = new RegExp(sector, 'i');
    if (minTrust) filter.trustScore = { ...filter.trustScore, $gte: Number(minTrust) };
    if (maxTrust) filter.trustScore = { ...filter.trustScore, $lte: Number(maxTrust) };
    if (minEsg)   filter.esgScore   = { $gte: Number(minEsg) };
    if (search)   filter.name       = new RegExp(search, 'i');

    const skip = (Number(page) - 1) * Number(limit);
    const [startups, total] = await Promise.all([
      Startup.find(filter).sort({ trustScore: -1 }).skip(skip).limit(Number(limit)),
      Startup.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: startups,
      pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single startup by ID
// @route   GET /api/v1/startups/:id
// @access  Private
const getStartup = async (req, res, next) => {
  try {
    const startup = await Startup.findById(req.params.id).populate('createdBy', 'name email');
    if (!startup) return res.status(404).json({ success: false, message: 'Startup not found.' });
    res.json({ success: true, data: startup });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a new startup (admin only)
// @route   POST /api/v1/startups
// @access  Private/Admin
const createStartup = async (req, res, next) => {
  try {
    const startup = await Startup.create({ ...req.body, createdBy: req.user._id });

    // Compute initial trust score
    startup.trustScore = computeTrustScore(startup);
    await startup.save();

    res.status(201).json({ success: true, data: startup });
  } catch (err) {
    next(err);
  }
};

// @desc    Express interest in a startup
// @route   POST /api/v1/startups/:id/interest
// @access  Private
const expressInterest = async (req, res, next) => {
  try {
    const startup = await Startup.findById(req.params.id);
    if (!startup) return res.status(404).json({ success: false, message: 'Startup not found.' });
    // In production: create a notification, send an email, etc.
    res.json({ success: true, message: `Interest recorded for ${startup.name}.` });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStartups, getStartup, createStartup, expressInterest };
