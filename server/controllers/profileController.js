const User = require('../models/User');
const InvestorProfile = require('../models/InvestorProfile');
const { ensureInvestorProfile } = require('../utils/ensureRoleProfiles');
const { ticketsFromInvestmentRange } = require('../utils/registrationMappers');

const INVESTOR_PROFILE_KEYS = [
  'organization',
  'entityType',
  'investmentRange',
  'investmentFocus',
  'linkedIn',
  'phone',
  'accreditationStatus',
  'minTicket',
  'maxTicket',
  'portfolioSize',
  'notablePortfolio',
  'investmentThesis',
  'yearsInvesting',
  'operatorBackground',
  'preferredStages',
  'geographyFocus',
];

/**
 * PUT /api/v1/profile/complete
 * Investors: updates InvestorProfile (+ minimal User identity fields).
 * Others: legacy User document update (founders use Startup + founder-profile APIs).
 */
const updateProfile = async (req, res, next) => {
  try {
    if (req.user.role === 'investor') {
      await ensureInvestorProfile(req.user);
      let doc = await InvestorProfile.findOne({ user: req.user._id });
      if (!doc) doc = new InvestorProfile({ user: req.user._id });

      for (const key of INVESTOR_PROFILE_KEYS) {
        if (req.body[key] !== undefined) doc[key] = req.body[key];
      }
      if (req.body.investmentRange !== undefined) {
        const { minTicket, maxTicket } = ticketsFromInvestmentRange(req.body.investmentRange);
        if (minTicket !== undefined) doc.minTicket = minTicket;
        if (maxTicket !== undefined) doc.maxTicket = maxTicket;
      }

      const userFieldUpdates = {};
      if (req.body.name !== undefined) userFieldUpdates.name = req.body.name;
      if (req.body.bio !== undefined) userFieldUpdates.bio = req.body.bio;
      if (req.body.avatarUrl !== undefined) userFieldUpdates.avatarUrl = req.body.avatarUrl;
      if (Object.keys(userFieldUpdates).length) {
        await User.findByIdAndUpdate(req.user._id, userFieldUpdates);
      }

      doc.recalculateCompletion();
      await doc.save();

      const u = await User.findById(req.user._id);
      return res.json({
        success: true,
        profileCompletionScore: doc.profileCompletionScore,
        profileComplete: doc.profileComplete,
        user: {
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          profileCompletionScore: u.profileCompletionScore,
          profileComplete: u.profileComplete,
        },
      });
    }

    const allowedFields = [
      'name',
      'bio',
      'avatarUrl',
      'linkedIn',
      'phone',
      'organization',
      'entityType',
      'companyName',
      'sector',
      'fundingGoal',
      'stage',
      'teamSize',
      'website',
      'pitchDeck',
      'milestones',
      'teamMembers',
      'investmentFocus',
      'investmentRange',
      'accreditationStatus',
      'minTicket',
      'maxTicket',
      'portfolioSize',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const score = user.calculateProfileScore();
    await user.save();

    res.json({
      success: true,
      profileCompletionScore: score,
      profileComplete: user.profileComplete,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileCompletionScore: user.profileCompletionScore,
        profileComplete: user.profileComplete,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getProfileScore = async (req, res, next) => {
  try {
    if (req.user.role === 'investor') {
      await ensureInvestorProfile(req.user);
      const doc = await InvestorProfile.findOne({ user: req.user._id });
      if (!doc) {
        return res.status(404).json({ success: false, message: 'Investor profile not found.' });
      }
      doc.recalculateCompletion();
      await doc.save();
      return res.json({
        success: true,
        profileCompletionScore: doc.profileCompletionScore,
        profileComplete: doc.profileComplete,
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const score = user.calculateProfileScore();
    await user.save();

    res.json({
      success: true,
      profileCompletionScore: score,
      profileComplete: user.profileComplete,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { updateProfile, getProfileScore };
