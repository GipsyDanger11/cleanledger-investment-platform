// server/controllers/roleDashboardController.js

const User = require('../models/User');
const Startup = require('../models/Startup');
const Investment = require('../models/Investment');

// Admin dashboard: summary stats
const getAdminDashboard = async (req, res) => {
  try {
    const [userCount, startupCount, investmentCount] = await Promise.all([
      User.countDocuments(),
      Startup.countDocuments(),
      Investment.countDocuments(),
    ]);
    res.json({ success: true, data: { userCount, startupCount, investmentCount } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Founder dashboard: their own startup details
const getFounderDashboard = async (req, res) => {
  try {
    const startup = await Startup.findOne({ createdBy: req.user._id })
      .populate('createdBy', 'name email')
      .lean();
    if (!startup) {
      return res.status(404).json({ success: false, message: 'Startup not found.' });
    }
    res.json({ success: true, data: startup });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Investor dashboard: marketplace of verified startups
const getInvestorDashboard = async (req, res) => {
  try {
    const startups = await Startup.find({ verificationStatus: 'verified' })
      .select('name sector geography description trustScore')
      .lean();
    res.json({ success: true, data: startups });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAdminDashboard,
  getFounderDashboard,
  getInvestorDashboard,
};
