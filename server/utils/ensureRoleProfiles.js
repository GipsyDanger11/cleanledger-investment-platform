const InvestorProfile = require('../models/InvestorProfile');
const FounderProfile = require('../models/FounderProfile');
const Startup = require('../models/Startup');
const { ticketsFromInvestmentRange } = require('./registrationMappers');

/**
 * Ensures an InvestorProfile exists (migrates legacy User-only investor fields once).
 */
async function ensureInvestorProfile(user) {
  if (!user || user.role !== 'investor') return null;
  let inv = await InvestorProfile.findOne({ user: user._id });
  if (inv) return inv;

  const { minTicket: mt, maxTicket: xt } = ticketsFromInvestmentRange(user.investmentRange);
  inv = new InvestorProfile({
    user: user._id,
    organization: user.organization || '',
    entityType: user.entityType || 'individual',
    investmentFocus: user.investmentFocus || '',
    investmentRange: user.investmentRange || '',
    linkedIn: user.linkedIn || '',
    phone: user.phone || '',
    accreditationStatus: user.accreditationStatus || '',
    minTicket: user.minTicket ?? mt,
    maxTicket: user.maxTicket ?? xt,
    portfolioSize: user.portfolioSize,
  });
  inv.recalculateCompletion();
  await inv.save();
  return inv;
}

/**
 * Ensures FounderProfile exists when a startup is already present (legacy users).
 */
async function ensureFounderProfile(user) {
  if (!user || (user.role !== 'startup' && user.role !== 'founder')) return null;
  let fp = await FounderProfile.findOne({ user: user._id });
  if (fp) return fp;
  const startup = await Startup.findOne({ createdBy: user._id }).select('_id').lean();
  if (!startup) return null;
  fp = await FounderProfile.create({ user: user._id, startup: startup._id });
  return fp;
}

module.exports = { ensureInvestorProfile, ensureFounderProfile };
