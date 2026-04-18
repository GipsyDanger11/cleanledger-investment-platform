const mongoose = require('mongoose');

// ── Vote sub-schema ──────────────────────────────────────
const voteSchema = new mongoose.Schema({
  investor:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  approved:  { type: Boolean, required: true },
  votedAt:   { type: Date, default: Date.now },
}, { _id: false });

// ── Trust Score History (R4) ─────────────────────────────
const trustHistorySchema = new mongoose.Schema({
  score:           { type: Number, required: true },
  profileScore:    Number,
  milestoneScore:  Number,
  fundAccuracy:    Number,
  sentimentScore:  Number,
  reason:          String,
  recordedAt:      { type: Date, default: Date.now },
}, { _id: false });

// ── Milestone sub-schema (R3) ────────────────────────────
const milestoneSchema = new mongoose.Schema({
  title:           { type: String, required: true },
  description:     String,
  targetDate:      Date,
  successCriteria: String,
  tranchePct:      { type: Number, default: 0, min: 0, max: 100 },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'submitted', 'verified', 'released', 'missed', 'complete'],
    default: 'pending',
  },
  proofUrl:      String,
  proofNote:     String,
  submittedAt:   Date,
  voteDeadline:  Date,
  votes:         [voteSchema],
  voteResult:    { type: String, enum: ['pending', 'passed', 'failed'], default: 'pending' },
  releasedAt:    Date,
  redFlagged:    { type: Boolean, default: false },
  trustPenalty:  { type: Number, default: 0 },
  commentCount:  { type: Number, default: 0 },
});

// ── Expense sub-schema (R2) ──────────────────────────────
const expenseSchema = new mongoose.Schema({
  category:    { type: String, enum: ['tech', 'marketing', 'operations', 'legal'], required: true },
  amount:      { type: Number, required: true },
  description: String,
  receiptUrl:  String,
  uploadedAt:  { type: Date, default: Date.now },
  verifiedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { _id: true });

// ── Variance Alert sub-schema (R2) ───────────────────────
const varianceAlertSchema = new mongoose.Schema({
  category:   String,
  plannedPct: Number,
  actualPct:  Number,
  flaggedAt:  { type: Date, default: Date.now },
  resolved:   { type: Boolean, default: false },
}, { _id: false });

// ── Team member sub-schema (R1) ──────────────────────────
const teamMemberSchema = new mongoose.Schema({
  name:               { type: String, required: true },
  role:               String,
  linkedIn:           String,
  idVerified:         { type: Boolean, default: false },
  verificationStatus: { type: String, enum: ['none', 'pending', 'verified'], default: 'none' },
}, { _id: true });

// ── Main Startup Schema ──────────────────────────────────
const startupSchema = new mongoose.Schema(
  {
    // ── Basic Info (R1)
    name:        { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['FinTech', 'HealthTech', 'EdTech', 'AgriTech', 'CleanTech', 'SaaS', 'E-Commerce', 'Other'],
      default: 'Other',
    },
    sector:      { type: String, required: true },
    geography:   { type: String, required: true },
    description: { type: String, required: true },
    tags:        [String],
    website:     String,

    // ── R1 — Verified Profile
    incorporationProofUrl: String,
    businessPlanUrl:       String,
    businessPlanSummary:   String,
    pitchDeckUrl:          String,
    teamMembers:           [teamMemberSchema],
    profileCompletionScore:{ type: Number, default: 0, min: 0, max: 100 },
    verificationStatus: {
      type: String,
      enum: ['unverified', 'in_review', 'verified', 'rejected'],
      default: 'unverified',
    },
    documents: [{
      name:   String,
      status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
      url:    String,
    }],

    // ── R2 — Fund Tracking
    fundingTarget:   { type: Number, required: true },
    totalRaised:     { type: Number, default: 0 },
    backers:         { type: Number, default: 0 },
    fundingTimeline: { type: String, enum: ['6 months','12 months','18 months','24 months'], default: '12 months' },
    fundAllocation: {
      tech:       { planned: { type: Number, default: 0 }, actual: { type: Number, default: 0 } },
      marketing:  { planned: { type: Number, default: 0 }, actual: { type: Number, default: 0 } },
      operations: { planned: { type: Number, default: 0 }, actual: { type: Number, default: 0 } },
      legal:      { planned: { type: Number, default: 0 }, actual: { type: Number, default: 0 } },
    },
    expenses:       [expenseSchema],
    varianceAlerts: [varianceAlertSchema],

    // ── R3 — Milestones
    milestones: [milestoneSchema],

    // ── R4 — Trust & Credibility Scoring
    trustScore:        { type: Number, default: 50, min: 0, max: 100 },
    riskLevel:         { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
    pitchQualityScore: { type: Number, default: 0, min: 0, max: 10 },
    credibilityIndex:  { type: Number, default: 0, min: 0, max: 100 },
    trustScoreHistory: [trustHistorySchema],

    // Component scores (cached for display)
    scoreComponents: {
      profileScore:   { type: Number, default: 0 },
      milestoneScore: { type: Number, default: 0 },
      fundAccuracy:   { type: Number, default: 100 },
      sentimentScore: { type: Number, default: 50 },
    },

    esgScore:   { type: Number, default: 0, min: 0, max: 100 },
    createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// ── R1: Profile Completion Score ─────────────────────────
startupSchema.methods.calculateProfileScore = function () {
  let score = 0;
  if (this.name) score += 10;
  if (this.category && this.category !== 'Other') score += 5;
  if (this.sector) score += 5;
  if (this.geography) score += 5;
  if (this.description && this.description.length > 50) score += 10;
  if (this.incorporationProofUrl) score += 15;
  if (this.businessPlanUrl || this.businessPlanSummary) score += 15;
  if (this.teamMembers && this.teamMembers.length >= 2) score += 10;
  if (this.milestones && this.milestones.length >= 3) score += 15;
  const alloc = this.fundAllocation;
  const totalPlanned = (alloc.tech.planned + alloc.marketing.planned +
                        alloc.operations.planned + alloc.legal.planned);
  if (totalPlanned > 0) score += 10;
  this.profileCompletionScore = Math.min(score, 100);
  return this.profileCompletionScore;
};

// ── R4: Weighted Trust Score Computation ─────────────────
startupSchema.methods.computeTrustScore = function (reason = 'auto') {
  // 1. Profile completeness (25%)
  const profileScore = this.profileCompletionScore || 0;

  // 2. Milestone performance (30%) — % of milestones verified/released
  const total = this.milestones.length;
  const done  = this.milestones.filter(m => ['verified','released'].includes(m.status)).length;
  const missed = this.milestones.filter(m => m.status === 'missed').length;
  let milestoneScore = total > 0 ? Math.max(0, ((done - missed * 0.5) / total) * 100) : 50;
  milestoneScore = Math.min(100, Math.max(0, milestoneScore));

  // 3. Fund usage accuracy (25%) — penalise unresolved variance alerts
  const unresolvedAlerts = (this.varianceAlerts || []).filter(a => !a.resolved).length;
  const fundAccuracy = Math.max(0, 100 - unresolvedAlerts * 15);

  // 4. Investor sentiment (20%) — % positive votes across all milestone votes
  let totalVotes = 0, approvedVotes = 0;
  for (const m of this.milestones) {
    totalVotes   += (m.votes || []).length;
    approvedVotes += (m.votes || []).filter(v => v.approved).length;
  }
  const sentimentScore = totalVotes > 0 ? (approvedVotes / totalVotes) * 100 : 50;

  // Weighted composite
  const trustScore = Math.round(
    profileScore   * 0.25 +
    milestoneScore * 0.30 +
    fundAccuracy   * 0.25 +
    sentimentScore * 0.20
  );

  // Risk level
  const riskLevel = trustScore >= 70 ? 'LOW' : trustScore >= 40 ? 'MEDIUM' : 'HIGH';

  // Credibility index: trust + verification bonus + pitch quality
  const verificationBonus = this.verificationStatus === 'verified' ? 10 : 0;
  const pitchBonus = (this.pitchQualityScore || 0) * 1.5;
  const credibilityIndex = Math.min(100, Math.round(trustScore * 0.7 + verificationBonus + pitchBonus));

  // Persist
  this.trustScore        = trustScore;
  this.riskLevel         = riskLevel;
  this.credibilityIndex  = credibilityIndex;
  this.scoreComponents   = { profileScore, milestoneScore: Math.round(milestoneScore), fundAccuracy, sentimentScore: Math.round(sentimentScore) };

  // Append to history (keep last 30)
  this.trustScoreHistory.push({ score: trustScore, profileScore, milestoneScore: Math.round(milestoneScore), fundAccuracy, sentimentScore: Math.round(sentimentScore), reason });
  if (this.trustScoreHistory.length > 30) {
    this.trustScoreHistory = this.trustScoreHistory.slice(-30);
  }

  return { trustScore, riskLevel, credibilityIndex, profileScore, milestoneScore: Math.round(milestoneScore), fundAccuracy, sentimentScore: Math.round(sentimentScore) };
};

// ── R2: Variance Check ────────────────────────────────────
startupSchema.methods.checkVariance = function () {
  const newAlerts = [];
  const alloc = this.fundAllocation;
  const categories = ['tech', 'marketing', 'operations', 'legal'];
  for (const cat of categories) {
    const planned = alloc[cat].planned;
    const actual  = alloc[cat].actual;
    if (planned === 0) continue;
    const deviation = Math.abs(actual - planned) / planned * 100;
    if (deviation > 20) {
      const existing = this.varianceAlerts.find(a => a.category === cat && !a.resolved);
      if (!existing) {
        newAlerts.push({ category: cat, plannedPct: planned, actualPct: actual });
        this.varianceAlerts.push({ category: cat, plannedPct: planned, actualPct: actual });
      }
    }
  }
  return newAlerts;
};

// ── R3: Resolve Milestone Votes ───────────────────────────
startupSchema.methods.resolveMilestoneVotes = function (milestoneId) {
  const m = this.milestones.id(milestoneId);
  if (!m || m.status !== 'submitted') return null;
  if (new Date() < new Date(m.voteDeadline)) return null;

  const total    = m.votes.length;
  const approved = m.votes.filter(v => v.approved).length;
  const pct      = total > 0 ? (approved / total) * 100 : 0;

  if (pct >= 60) {
    m.status     = 'verified';
    m.voteResult = 'passed';
    m.releasedAt = new Date();
  } else {
    m.voteResult  = 'failed';
    m.redFlagged  = true;
    m.trustPenalty = 5;
    this.trustScore = Math.max(0, this.trustScore - m.trustPenalty);
  }
  return m;
};

module.exports = mongoose.model('Startup', startupSchema);
