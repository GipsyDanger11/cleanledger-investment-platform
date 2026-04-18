const InvestorProfile = require('../models/InvestorProfile');
const { ticketsFromInvestmentRange } = require('../utils/registrationMappers');
const { ensureInvestorProfile } = require('../utils/ensureRoleProfiles');

const INVESTOR_FIELDS = [
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

exports.getMy = async (req, res, next) => {
  try {
    await ensureInvestorProfile(req.user);
    const doc = await InvestorProfile.findOne({ user: req.user._id }).lean();
    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
};

exports.putMy = async (req, res, next) => {
  try {
    await ensureInvestorProfile(req.user);
    let doc = await InvestorProfile.findOne({ user: req.user._id });
    if (!doc) {
      doc = new InvestorProfile({ user: req.user._id });
    }
    for (const key of INVESTOR_FIELDS) {
      if (req.body[key] !== undefined) doc[key] = req.body[key];
    }
    if (req.body.investmentRange !== undefined) {
      const { minTicket, maxTicket } = ticketsFromInvestmentRange(req.body.investmentRange);
      if (minTicket !== undefined) doc.minTicket = minTicket;
      if (maxTicket !== undefined) doc.maxTicket = maxTicket;
    }
    doc.recalculateCompletion();
    await doc.save();
    res.json({
      success: true,
      data: doc,
      profileComplete: doc.profileComplete,
      profileCompletionScore: doc.profileCompletionScore,
    });
  } catch (err) {
    next(err);
  }
};
