const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:     { type: String, required: true, minlength: 8, select: false },
    role:         { type: String, enum: ['investor', 'startup', 'admin', 'founder'], default: 'investor' },
    organization: { type: String, trim: true },
    entityType:   {
      type: String,
      enum: [
        'individual', 'company', 'fund', 'spv',
        'family_office', 'vc_fund', 'angel_network', 'corporate',
      ],
      default: 'individual',
    },

    // ── Profile completion ──
    profileComplete:        { type: Boolean, default: false },
    profileCompletionScore: { type: Number, default: 0, min: 0, max: 100 },

    // ── Shared optional fields ──
    bio:       { type: String, trim: true, maxlength: 500 },
    avatarUrl: { type: String, trim: true },
    linkedIn:  { type: String, trim: true },
    phone:     { type: String, trim: true },

    // ── Startup-specific fields ──
    companyName:  { type: String, trim: true },
    sector:       { type: String, trim: true },
    fundingGoal:  { type: Number },
    stage:        { type: String, enum: ['pre-seed', 'seed', 'series-a', 'series-b', 'series-c', 'growth', ''], default: '' },
    teamSize:     { type: Number },
    website:      { type: String, trim: true },
    pitchDeck:    { type: String, trim: true },           // URL to uploaded file
    milestones:   [{ title: String, targetDate: Date, description: String }],
    teamMembers:  [{ name: String, role: String, linkedIn: String }],

    // ── Investor-specific fields ──
    investmentFocus:   { type: String, trim: true },
    investmentRange:   { type: String, trim: true },
    accreditationStatus: { type: String, trim: true },
    minTicket:       { type: Number },
    maxTicket:       { type: Number },
    portfolioSize:   { type: Number },

    // ── KYC ──
    kyc: {
      status:      { type: String, enum: ['pending', 'in_review', 'verified', 'rejected'], default: 'pending' },
      submittedAt: Date,
      verifiedAt:  Date,
      documents:   [{ name: String, url: String, uploadedAt: Date }],
    },
    wallet: { type: String, default: null },
    notifications: [{
      message:   String,
      icon:      String,
      read:      { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
    }],
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

// Calculate profile completion score
userSchema.methods.calculateProfileScore = function () {
  let score = 0;
  if (this.name) score += 10;
  if (this.role && this.role !== 'admin') score += 10;
  if (this.organization || this.companyName) score += 20;
  if (this.linkedIn) score += 15;

  if (this.role === 'startup') {
    if (this.fundingGoal) score += 10;
    if (this.sector) score += 10;
    if (this.teamMembers && this.teamMembers.length > 0) score += 10;
    if (this.kyc && this.kyc.documents && this.kyc.documents.length > 0) score += 15;
  } else if (this.role === 'investor') {
    if (this.investmentFocus) score += 10;
    if (this.investmentRange) score += 5;
    if (this.minTicket || this.maxTicket) score += 10;
    if (this.portfolioSize) score += 10;
    if (this.kyc && this.kyc.documents && this.kyc.documents.length > 0) score += 15;
  }

  this.profileCompletionScore = Math.min(score, 100);
  this.profileComplete = this.profileCompletionScore >= 70;
  return this.profileCompletionScore;
};

module.exports = mongoose.model('User', userSchema);
