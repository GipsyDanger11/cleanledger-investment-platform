// server/controllers/roleDashboardController.js

const User = require('../models/User');
const Startup = require('../models/Startup');
const Investment = require('../models/Investment');
const Notification = require('../models/Notification');

// Admin dashboard: summary stats + users list
const getAdminDashboard = async (req, res) => {
  try {
    const [userCount, startupCount, investmentCount, users, startups] = await Promise.all([
      User.countDocuments(),
      Startup.countDocuments(),
      Investment.countDocuments(),
      User.find().select('name email role kyc.status createdAt').sort({ createdAt: -1 }).limit(50).lean(),
      Startup.find().select('name sector verificationStatus trustScore totalRaised fundingTarget').lean(),
    ]);

    const totalFundsRaised = startups.reduce((s, st) => s + (st.totalRaised || 0), 0);
    const pendingVerifications = startups.filter(s => s.verificationStatus === 'in_review').length;
    const activeInvestors = await Investment.distinct('investor');

    res.json({
      success: true,
      data: {
        userCount,
        startupCount,
        investmentCount,
        totalFundsRaised,
        pendingVerifications,
        activeInvestors: activeInvestors.length,
        users: users.map(u => ({
          _id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          kycStatus: u.kyc?.status || 'unverified',
        })),
        startups,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Founder dashboard: their own startup + notifications
const getFounderDashboard = async (req, res) => {
  try {
    const startup = await Startup.findOne({ createdBy: req.user._id })
      .populate('createdBy', 'name email')
      .lean();
    if (!startup) {
      return res.status(404).json({ success: false, message: 'Startup not found.' });
    }

    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 }).limit(20).lean();
    const unreadCount = notifications.filter(n => !n.read).length;

    const investorCount = await Investment.distinct('investor', { startup: startup._id });

    res.json({
      success: true,
      data: {
        startup,
        notifications,
        unreadCount,
        investorCount: investorCount.length,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Investor dashboard: portfolio summary + investments + notifications
const getInvestorDashboard = async (req, res) => {
  try {
    const investments = await Investment.find({ investor: req.user._id, status: 'active' })
      .populate('startup', 'name sector trustScore esgScore verificationStatus fundingTarget totalRaised')
      .sort({ date: -1 })
      .lean();

    const portfolioValue = investments.reduce((s, i) => s + i.amount, 0);
    const avgTrustScore = investments.length
      ? Math.round(investments.reduce((s, i) => s + (i.trustScore || 0), 0) / investments.length)
      : 0;

    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 }).limit(20).lean();
    const unreadCount = notifications.filter(n => !n.read).length;

    // Find milestones needing votes across invested startups
    const startupIds = investments.map(i => i.startup?._id).filter(Boolean);
    const startupsWithMilestones = await Startup.find({ _id: { $in: startupIds } })
      .select('name milestones').lean();

    const pendingVotes = [];
    for (const s of startupsWithMilestones) {
      for (const m of s.milestones || []) {
        if (m.status === 'submitted' && m.voteDeadline && new Date(m.voteDeadline) > new Date()) {
          const alreadyVoted = (m.votes || []).some(v => v.investor?.toString() === req.user._id.toString());
          if (!alreadyVoted) {
            pendingVotes.push({
              startupId: s._id,
              startupName: s.name,
              milestoneId: m._id,
              milestoneTitle: m.title,
              voteDeadline: m.voteDeadline,
            });
          }
        }
      }
    }

    res.json({
      success: true,
      data: {
        portfolioValue,
        avgTrustScore,
        tranchesReleased: investments.length,
        investments,
        notifications,
        unreadCount,
        pendingVotes,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getAdminDashboard,
  getFounderDashboard,
  getInvestorDashboard,
};
