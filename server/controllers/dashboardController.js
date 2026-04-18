const Investment = require('../models/Investment');
const User = require('../models/User');

const getSummary = async (req, res, next) => {
  try {
    const investments = await Investment.find({ investor: req.user._id, status: 'active' });
    const portfolioValue = investments.reduce((s, i) => s + i.amount, 0);
    const tranchesReleased = investments.length;
    const avgTrustScore = investments.length
      ? Math.round(investments.reduce((s, i) => s + i.trustScore, 0) / investments.length)
      : 0;
    res.json({ success: true, data: { portfolioValue, tranchesReleased, avgTrustScore } });
  } catch (err) {
    next(err);
  }
};

const getActiveInvestments = async (req, res, next) => {
  try {
    const investments = await Investment.find({ investor: req.user._id, status: 'active' })
      .populate('startup', 'name sector trustScore')
      .sort({ date: -1 });
    res.json({ success: true, data: investments });
  } catch (err) {
    next(err);
  }
};

const getNotifications = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('notifications');
    const notifications = (user.notifications || [])
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 20);
    res.json({ success: true, data: notifications });
  } catch (err) {
    next(err);
  }
};

module.exports = { getSummary, getActiveInvestments, getNotifications };
