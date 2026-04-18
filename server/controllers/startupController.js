const crypto = require('crypto');
const Startup = require('../models/Startup');
const AuditEntry = require('../models/AuditEntry');

// ── helpers ──────────────────────────────────────────────
const catchAsync = fn => (req, res, next) => fn(req, res, next).catch(next);

const apiError = (res, status, message) =>
  res.status(status).json({ success: false, message });

// ── R1: Create / Update Startup Profile ─────────────────
exports.createStartup = catchAsync(async (req, res) => {
  const existing = await Startup.findOne({ createdBy: req.user._id });
  if (existing) {
    return apiError(res, 400, 'Startup profile already exists. Use PATCH to update.');
  }
  const startup = await Startup.create({ ...req.body, createdBy: req.user._id });
  startup.calculateProfileScore();
  await startup.save();
  res.status(201).json({ success: true, data: startup });
});

exports.updateStartup = catchAsync(async (req, res) => {
  const startup = await Startup.findOne({
    _id: req.params.id,
    createdBy: req.user._id,
  });
  if (!startup) return apiError(res, 404, 'Startup not found or unauthorized');

  // Merge top-level fields
  const allowed = [
    'name', 'category', 'sector', 'geography', 'description', 'tags', 'website',
    'incorporationProofUrl', 'businessPlanUrl', 'businessPlanSummary',
    'pitchDeckUrl', 'teamMembers', 'fundingTarget', 'fundingTimeline',
    'fundAllocation', 'verificationStatus', 'documents',
  ];
  for (const key of allowed) {
    if (req.body[key] !== undefined) startup[key] = req.body[key];
  }
  startup.calculateProfileScore();
  await startup.save();
  res.json({ success: true, data: startup });
});

exports.getStartup = catchAsync(async (req, res) => {
  const startup = await Startup.findById(req.params.id)
    .populate('createdBy', 'name email avatarUrl')
    .lean();
  if (!startup) return apiError(res, 404, 'Startup not found');
  res.json({ success: true, data: startup });
});

exports.getMyStartup = catchAsync(async (req, res) => {
  const startup = await Startup.findOne({ createdBy: req.user._id });
  if (!startup) return apiError(res, 404, 'No startup profile found');
  res.json({ success: true, data: startup });
});

exports.listStartups = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.sector) filter.sector = req.query.sector;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.verificationStatus) filter.verificationStatus = req.query.verificationStatus;

  const startups = await Startup.find(filter)
    .select('name category sector geography description tags fundingTarget totalRaised backers trustScore esgScore verificationStatus profileCompletionScore createdAt')
    .sort({ trustScore: -1 })
    .lean();
  res.json({ success: true, count: startups.length, data: startups });
});

// ── R1: Admin — update verification status ───────────────
exports.updateVerificationStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const valid = ['unverified', 'in_review', 'verified', 'rejected'];
  if (!valid.includes(status)) return apiError(res, 400, 'Invalid verification status');

  const startup = await Startup.findByIdAndUpdate(
    req.params.id,
    { verificationStatus: status },
    { new: true }
  );
  if (!startup) return apiError(res, 404, 'Startup not found');
  res.json({ success: true, data: startup });
});

// ── R2: Fund Allocation — set plan ───────────────────────
exports.setFundPlan = catchAsync(async (req, res) => {
  const startup = await Startup.findOne({ _id: req.params.id, createdBy: req.user._id });
  if (!startup) return apiError(res, 404, 'Startup not found or unauthorized');

  const { tech, marketing, operations, legal } = req.body;
  const total = (tech || 0) + (marketing || 0) + (operations || 0) + (legal || 0);
  if (total > 100) return apiError(res, 400, 'Fund allocation percentages must not exceed 100%');

  startup.fundAllocation.tech.planned       = tech || 0;
  startup.fundAllocation.marketing.planned  = marketing || 0;
  startup.fundAllocation.operations.planned = operations || 0;
  startup.fundAllocation.legal.planned      = legal || 0;
  startup.calculateProfileScore();
  await startup.save();
  res.json({ success: true, data: startup.fundAllocation });
});

// ── R2: Upload Expense ────────────────────────────────────
exports.addExpense = catchAsync(async (req, res) => {
  const startup = await Startup.findOne({ _id: req.params.id, createdBy: req.user._id });
  if (!startup) return apiError(res, 404, 'Startup not found or unauthorized');

  const { category, amount, description, receiptUrl } = req.body;
  const validCats = ['tech', 'marketing', 'operations', 'legal'];
  if (!validCats.includes(category)) return apiError(res, 400, 'Invalid expense category');

  // Add expense
  startup.expenses.push({ category, amount, description, receiptUrl });

  // Recalculate actual allocation for this category
  const catTotal = startup.expenses
    .filter(e => e.category === category)
    .reduce((sum, e) => sum + e.amount, 0);
  const pct = startup.totalRaised > 0 ? (catTotal / startup.totalRaised) * 100 : 0;
  startup.fundAllocation[category].actual = parseFloat(pct.toFixed(2));

  // Check variance — flag if >20% deviation
  const newAlerts = startup.checkVariance();

  // Write immutable audit entry
  const lastEntry = await AuditEntry.findOne().sort({ blockNumber: -1 }).lean();
  const blockNumber = (lastEntry?.blockNumber || 0) + 1;
  const previousHash = lastEntry?.hash || '0000000000000000';
  const payload = `${blockNumber}${category}${amount}${Date.now()}`;
  const hash = crypto.createHash('sha256').update(payload).digest('hex');

  await AuditEntry.create({
    blockNumber,
    type: 'funding_allocation',
    fromEntity: req.user.name || req.user.email,
    toEntity: startup.name,
    amount,
    hash,
    previousHash,
    startup: startup._id,
    initiatedBy: req.user._id,
    metadata: { category, description },
  });

  await startup.save();
  res.status(201).json({
    success: true,
    data: { expense: startup.expenses[startup.expenses.length - 1], fundAllocation: startup.fundAllocation, newAlerts },
  });
});

// ── R2: Get Fund Dashboard ────────────────────────────────
exports.getFundDashboard = catchAsync(async (req, res) => {
  const startup = await Startup.findById(req.params.id)
    .select('name fundAllocation expenses varianceAlerts totalRaised fundingTarget')
    .lean();
  if (!startup) return apiError(res, 404, 'Startup not found');
  res.json({ success: true, data: startup });
});

// ── R2: Get Variance Alerts ────────────────────────────────
exports.getVarianceAlerts = catchAsync(async (req, res) => {
  const startup = await Startup.findById(req.params.id).select('varianceAlerts').lean();
  if (!startup) return apiError(res, 404, 'Startup not found');
  res.json({ success: true, data: startup.varianceAlerts });
});

// ── R3: Create Milestone ─────────────────────────────────
exports.createMilestone = catchAsync(async (req, res) => {
  const startup = await Startup.findOne({ _id: req.params.id, createdBy: req.user._id });
  if (!startup) return apiError(res, 404, 'Startup not found or unauthorized');

  const { title, description, targetDate, successCriteria, tranchePct } = req.body;

  // Validate total tranche % doesn't exceed 100
  const currentTotal = startup.milestones.reduce((s, m) => s + (m.tranchePct || 0), 0);
  if (currentTotal + (tranchePct || 0) > 100) {
    return apiError(res, 400, `Total tranche % would exceed 100%. Currently allocated: ${currentTotal}%`);
  }

  startup.milestones.push({ title, description, targetDate, successCriteria, tranchePct: tranchePct || 0 });
  startup.calculateProfileScore();
  await startup.save();
  res.status(201).json({ success: true, data: startup.milestones[startup.milestones.length - 1] });
});

// ── R3: Update Milestone Status ───────────────────────────
exports.updateMilestoneStatus = catchAsync(async (req, res) => {
  const startup = await Startup.findOne({ _id: req.params.id, createdBy: req.user._id });
  if (!startup) return apiError(res, 404, 'Startup not found or unauthorized');

  const m = startup.milestones.id(req.params.mid);
  if (!m) return apiError(res, 404, 'Milestone not found');

  const { status } = req.body;
  const allowed = ['pending', 'in_progress'];
  if (!allowed.includes(status)) return apiError(res, 400, 'Use /submit endpoint to submit for review');
  m.status = status;
  await startup.save();
  res.json({ success: true, data: m });
});

// ── R3: Submit Milestone Proof ────────────────────────────
exports.submitMilestoneProof = catchAsync(async (req, res) => {
  const startup = await Startup.findOne({ _id: req.params.id, createdBy: req.user._id });
  if (!startup) return apiError(res, 404, 'Startup not found or unauthorized');

  const m = startup.milestones.id(req.params.mid);
  if (!m) return apiError(res, 404, 'Milestone not found');
  if (!['pending', 'in_progress'].includes(m.status)) {
    return apiError(res, 400, 'Milestone is not in a submittable state');
  }

  m.status = 'submitted';
  m.proofUrl = req.body.proofUrl || '';
  m.proofNote = req.body.proofNote || '';
  m.submittedAt = new Date();
  m.voteDeadline = new Date(Date.now() + 48 * 60 * 60 * 1000); // +48h
  m.voteResult = 'pending';
  m.votes = [];

  // Audit entry for submission
  const lastEntry = await AuditEntry.findOne().sort({ blockNumber: -1 }).lean();
  const blockNumber = (lastEntry?.blockNumber || 0) + 1;
  const previousHash = lastEntry?.hash || '0000000000000000';
  const payload = `${blockNumber}milestone_submit${m._id}${Date.now()}`;
  const hash = crypto.createHash('sha256').update(payload).digest('hex');
  await AuditEntry.create({
    blockNumber, type: 'milestone_complete',
    fromEntity: startup.name, toEntity: 'Investor Pool',
    hash, previousHash, startup: startup._id, initiatedBy: req.user._id,
    metadata: { milestoneId: m._id, title: m.title },
  });

  await startup.save();
  res.json({ success: true, data: m });
});

// ── R3: Cast Vote ─────────────────────────────────────────
exports.castVote = catchAsync(async (req, res) => {
  const startup = await Startup.findById(req.params.id);
  if (!startup) return apiError(res, 404, 'Startup not found');

  const m = startup.milestones.id(req.params.mid);
  if (!m) return apiError(res, 404, 'Milestone not found');
  if (m.status !== 'submitted') return apiError(res, 400, 'Milestone is not open for voting');
  if (new Date() > new Date(m.voteDeadline)) return apiError(res, 400, 'Voting window has closed');

  // Prevent double-voting
  const alreadyVoted = m.votes.find(v => v.investor.toString() === req.user._id.toString());
  if (alreadyVoted) return apiError(res, 400, 'You have already voted on this milestone');

  m.votes.push({ investor: req.user._id, approved: req.body.approved === true });

  // Check if voting window is closed OR enough votes to decide early
  const total = m.votes.length;
  const approved = m.votes.filter(v => v.approved).length;
  const pct = total > 0 ? (approved / total) * 100 : 0;

  // Auto-resolve if window passed
  if (new Date() >= new Date(m.voteDeadline)) {
    startup.resolveMilestoneVotes(m._id);
  }

  await startup.save();
  res.json({
    success: true,
    data: { vote: { approved: req.body.approved }, stats: { total, approved, pct: pct.toFixed(1) } },
  });
});

// ── R3: Get Milestone Timeline ────────────────────────────
exports.getMilestones = catchAsync(async (req, res) => {
  const startup = await Startup.findById(req.params.id)
    .select('name milestones trustScore fundingTarget totalRaised')
    .populate('milestones.votes.investor', 'name')
    .lean();
  if (!startup) return apiError(res, 404, 'Startup not found');
  res.json({ success: true, data: startup });
});

// ── R3: Check and flag missed milestones ──────────────────
exports.checkMissedMilestones = catchAsync(async (req, res) => {
  const now = new Date();
  const startups = await Startup.find({
    'milestones.targetDate': { $lt: now },
    'milestones.status': { $in: ['pending', 'in_progress'] },
  });

  let flagged = 0;
  for (const startup of startups) {
    let changed = false;
    for (const m of startup.milestones) {
      if (['pending', 'in_progress'].includes(m.status) && m.targetDate && new Date(m.targetDate) < now) {
        m.status = 'missed';
        m.redFlagged = true;
        m.trustPenalty = 8;
        startup.trustScore = Math.max(0, startup.trustScore - 8);
        changed = true;
        flagged++;
      }
    }
    if (changed) await startup.save();
  }
  res.json({ success: true, message: `Flagged ${flagged} missed milestones` });
});
