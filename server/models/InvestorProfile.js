const mongoose = require('mongoose');

/**
 * Investor-only profile data (separate collection from founders/startups).
 * All investor onboarding and completion fields live here.
 */
const investorProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

    organization: { type: String, trim: true },
    entityType: {
      type: String,
      enum: [
        'individual',
        'company',
        'fund',
        'spv',
        'family_office',
        'vc_fund',
        'angel_network',
        'corporate',
      ],
      default: 'individual',
    },

    investmentRange: { type: String, trim: true },
    investmentFocus: { type: String, trim: true },
    linkedIn: { type: String, trim: true },
    phone: { type: String, trim: true },
    accreditationStatus: { type: String, trim: true },

    minTicket: { type: Number },
    maxTicket: { type: Number },
    portfolioSize: { type: Number },

    /** Portfolio & experience (completion wizard / extended registration) */
    notablePortfolio: { type: String, trim: true, maxlength: 2000 },
    investmentThesis: { type: String, trim: true, maxlength: 2000 },
    yearsInvesting: { type: Number, min: 0 },
    operatorBackground: { type: String, trim: true, maxlength: 2000 },
    preferredStages: [{ type: String, trim: true }],
    geographyFocus: { type: String, trim: true, maxlength: 500 },

    profileCompletionScore: { type: Number, default: 0, min: 0, max: 100 },
    profileComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

investorProfileSchema.methods.recalculateCompletion = function () {
  let score = 0;
  if (this.organization) score += 12;
  if (this.entityType && this.entityType !== 'individual') score += 5;
  if (this.investmentFocus) score += 10;
  if (this.investmentRange) score += 10;
  if (this.linkedIn) score += 12;
  if (this.phone) score += 6;
  if (this.minTicket != null || this.maxTicket != null) score += 10;
  if (this.portfolioSize != null && this.portfolioSize > 0) score += 8;
  if (this.notablePortfolio && this.notablePortfolio.length > 20) score += 10;
  if (this.investmentThesis && this.investmentThesis.length > 20) score += 8;
  if (this.yearsInvesting != null && this.yearsInvesting > 0) score += 7;
  if (this.operatorBackground && this.operatorBackground.length > 20) score += 7;
  if (this.preferredStages?.length) score += 5;
  if (this.geographyFocus) score += 5;
  if (this.accreditationStatus) score += 8;

  this.profileCompletionScore = Math.min(score, 100);
  this.profileComplete = this.profileCompletionScore >= 70;
  return this.profileCompletionScore;
};

investorProfileSchema.post('save', async function () {
  const User = mongoose.model('User');
  await User.findByIdAndUpdate(this.user, {
    organization: this.organization || undefined,
    entityType: this.entityType,
    profileComplete: this.profileComplete,
    profileCompletionScore: this.profileCompletionScore,
  });
});

module.exports = mongoose.model('InvestorProfile', investorProfileSchema);
