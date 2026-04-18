const Startup      = require('../models/Startup');
const Notification = require('../models/Notification');
const Investment   = require('../models/Investment');

const catchAsync = fn => (req, res, next) => fn(req, res, next).catch(next);
const apiError   = (res, status, msg) => res.status(status).json({ success: false, message: msg });

// ── Helper: push notification to a user ──────────────────
const pushNotification = async (recipientId, type, title, body, link, startupId, meta = {}) => {
  try {
    await Notification.create({ recipient: recipientId, type, title, body, link, startup: startupId, meta });
  } catch { /* non-blocking */ }
};

// ── R4: Compute Trust Score ───────────────────────────────
exports.computeTrustScore = catchAsync(async (req, res) => {
  const startup = await Startup.findById(req.params.id);
  if (!startup) return apiError(res, 404, 'Startup not found');

  const result = startup.computeTrustScore(req.body.reason || 'manual');
  await startup.save();

  // Notify startup owner of score change
  await pushNotification(
    startup.createdBy, 'trust_score_change',
    `Trust Score updated: ${result.trustScore}/100`,
    `Risk level: ${result.riskLevel} | Credibility: ${result.credibilityIndex}`,
    `/funds/${startup._id}`,
    startup._id
  );

  res.json({ success: true, data: result });
});

// ── R4: Get Trust Score Breakdown ────────────────────────
exports.getTrustScore = catchAsync(async (req, res) => {
  const startup = await Startup.findById(req.params.id)
    .select('trustScore riskLevel credibilityIndex pitchQualityScore scoreComponents profileCompletionScore verificationStatus name')
    .lean();
  if (!startup) return apiError(res, 404, 'Startup not found');

  res.json({
    success: true,
    data: {
      trustScore:        startup.trustScore,
      riskLevel:         startup.riskLevel || 'MEDIUM',
      credibilityIndex:  startup.credibilityIndex || 0,
      pitchQualityScore: startup.pitchQualityScore || 0,
      verificationStatus:startup.verificationStatus,
      profileCompletionScore: startup.profileCompletionScore,
      scoreComponents:   startup.scoreComponents || {
        profileScore: 0, milestoneScore: 0, fundAccuracy: 100, sentimentScore: 50
      },
    },
  });
});

// ── R4: Get Trust Score History ───────────────────────────
exports.getTrustHistory = catchAsync(async (req, res) => {
  const startup = await Startup.findById(req.params.id)
    .select('trustScoreHistory name trustScore riskLevel')
    .lean();
  if (!startup) return apiError(res, 404, 'Startup not found');

  res.json({
    success: true,
    data: {
      history:    startup.trustScoreHistory || [],
      current:    startup.trustScore,
      riskLevel:  startup.riskLevel,
    },
  });
});

// ── R4: Set AI Pitch Quality Score ───────────────────────
exports.setPitchQualityScore = catchAsync(async (req, res) => {
  const { pitchQualityScore } = req.body;
  if (pitchQualityScore < 0 || pitchQualityScore > 10) {
    return apiError(res, 400, 'Pitch quality score must be 0–10');
  }
  const startup = await Startup.findByIdAndUpdate(
    req.params.id,
    { pitchQualityScore },
    { new: true }
  ).select('pitchQualityScore credibilityIndex name');
  if (!startup) return apiError(res, 404, 'Startup not found');
  res.json({ success: true, data: startup });
});

// ── G3: Create Notification (internal helper — exposed for admin) ──
exports.createNotification = pushNotification;

// ── Notify all investors of a startup ────────────────────
exports.notifyInvestors = async (startupId, type, title, body, link) => {
  try {
    const investments = await Investment.find({ startup: startupId }).select('investor').lean();
    const recipientIds = [...new Set(investments.map(i => i.investor.toString()))];
    await Notification.insertMany(
      recipientIds.map(rid => ({ recipient: rid, type, title, body, link, startup: startupId }))
    );
  } catch { /* non-blocking */ }
};
