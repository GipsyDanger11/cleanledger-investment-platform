const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ── Vote sub-schema ──────────────────────────────────────
const voteSchema = new mongoose.Schema({
  investor:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  approved:  { type: Boolean, required: true },
  votedAt:   { type: Date, default: Date.now },
}, { _id: false });

// ── Milestone sub-schema (R3) ────────────────────────────
const milestoneSchema = new mongoose.Schema({
  title:           { type: String, required: true },
  description:     String,
  targetDate:      Date,
  successCriteria: String,
  tranchePct:      { type: Number, default: 0, min: 0, max: 100 }, // % of total funding
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'submitted', 'verified', 'released', 'missed'],
    default: 'pending',
  },
  proofUrl:      String,   // demo link / screenshot / metrics doc URL
  proofNote:     String,
  submittedAt:   Date,
  voteDeadline:  Date,     // submittedAt + 48h
  votes:         [voteSchema],
  voteResult:    { type: String, enum: ['pending', 'passed', 'failed'], default: 'pending' },
  releasedAt:    Date,
  redFlagged:    { type: Boolean, default: false },
  trustPenalty:  { type: Number, default: 0 },
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
    // ── Basic Info (R1) ──
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

    // ── R1 — Verified Profile ──
    incorporationProofUrl: { type: String, trim: true },
    businessPlanUrl:       { type: String, trim: true },
    businessPlanSummary:   { type: String, trim: true },  // AI-generated
    pitchDeckUrl:          { type: String, trim: true },
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

    // ── R2 — Fund Tracking ──
    fundingTarget:  { type: Number, required: true },
    totalRaised:    { type: Number, default: 0 },
    backers:        { type: Number, default: 0 },
    fundingTimeline:{ type: String, enum: ['6 months','12 months','18 months','24 months'], default: '12 months' },

    fundAllocation: {
      tech:       { planned: { type: Number, default: 0 }, actual: { type: Number, default: 0 } },
      marketing:  { planned: { type: Number, default: 0 }, actual: { type: Number, default: 0 } },
      operations: { planned: { type: Number, default: 0 }, actual: { type: Number, default: 0 } },
      legal:      { planned: { type: Number, default: 0 }, actual: { type: Number, default: 0 } },
    },
    expenses:       [expenseSchema],
    varianceAlerts: [varianceAlertSchema],

    // ── R3 — Milestones ──
    milestones: [milestoneSchema],

    // ── Trust & ESG Scores ──
    trustScore: { type: Number, default: 50, min: 0, max: 100 },
    esgScore:   { type: Number, default: 0, min: 0, max: 100 },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// ── Calculate profile completion score (R1) ──────────────
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

// ── Check fund variance alerts (R2) ─────────────────────
startupSchema.methods.checkVariance = function () {
  if (this.totalRaised === 0) return [];
  const newAlerts = [];
  const alloc = this.fundAllocation;
  const categories = ['tech', 'marketing', 'operations', 'legal'];
  for (const cat of categories) {
    const planned = alloc[cat].planned;
    const actual = alloc[cat].actual;
    if (planned === 0) continue;
    const deviation = Math.abs(actual - planned) / planned * 100;
    if (deviation > 20) {
      const existing = this.varianceAlerts.find(
        a => a.category === cat && !a.resolved
      );
      if (!existing) {
        newAlerts.push({ category: cat, plannedPct: planned, actualPct: actual });
        this.varianceAlerts.push({ category: cat, plannedPct: planned, actualPct: actual });
      }
    }
  }
  return newAlerts;
};

// ── Resolve milestone votes (R3) ──────────────────────────
startupSchema.methods.resolveMilestoneVotes = function (milestoneId) {
  const m = this.milestones.id(milestoneId);
  if (!m || m.status !== 'submitted') return null;
  if (new Date() < new Date(m.voteDeadline)) return null; // still open

  const total = m.votes.length;
  if (total === 0) return null;
  const approved = m.votes.filter(v => v.approved).length;
  const pct = approved / total * 100;

  if (pct >= 60) {
    m.status = 'verified';
    m.voteResult = 'passed';
    m.releasedAt = new Date();
  } else {
    m.voteResult = 'failed';
    m.redFlagged = true;
    m.trustPenalty = 5;
    this.trustScore = Math.max(0, this.trustScore - m.trustPenalty);
  }
  return m;
};

module.exports = mongoose.model('Startup', startupSchema);
