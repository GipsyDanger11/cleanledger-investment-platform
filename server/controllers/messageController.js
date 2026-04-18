const Message      = require('../models/Message');
const Startup      = require('../models/Startup');
const Notification = require('../models/Notification');
const Investment   = require('../models/Investment');

const catchAsync = fn => (req, res, next) => fn(req, res, next).catch(next);
const apiError   = (res, status, msg) => res.status(status).json({ success: false, message: msg });

// ── Helper: notify all investors of a startup ─────────────
const notifyInvestors = async (startupId, type, title, body, link) => {
  try {
    const investments = await Investment.find({ startup: startupId }).select('investor').lean();
    const ids = [...new Set(investments.map(i => i.investor.toString()))];
    if (ids.length > 0) {
      await Notification.insertMany(ids.map(rid => ({
        recipient: rid, type, title, body, link, startup: startupId,
      })));
    }
  } catch { /* non-blocking */ }
};

// ══════════════════════════════════════════════════════════
// Q & A
// ══════════════════════════════════════════════════════════

// GET /api/v1/startups/:id/qa
exports.listQA = catchAsync(async (req, res) => {
  const messages = await Message.find({ startup: req.params.id, type: 'qa' })
    .sort({ pinned: -1, createdAt: -1 })
    .populate('author', 'name avatarUrl')
    .lean();

  // Anonymise investor identity where requested
  const cleaned = messages.map(m => ({
    ...m,
    author: m.isAnonymous ? { name: 'Anonymous Investor', avatarUrl: null } : m.author,
  }));
  res.json({ success: true, count: cleaned.length, data: cleaned });
});

// POST /api/v1/startups/:id/qa  — investor asks question
exports.askQuestion = catchAsync(async (req, res) => {
  const { question, isAnonymous } = req.body;
  if (!question?.trim()) return apiError(res, 400, 'Question text is required');

  const startup = await Startup.findById(req.params.id).select('name createdBy').lean();
  if (!startup) return apiError(res, 404, 'Startup not found');

  const msg = await Message.create({
    type: 'qa', startup: req.params.id,
    author: req.user._id, question: question.trim(),
    isAnonymous: Boolean(isAnonymous),
  });

  // Notify startup owner
  await Notification.create({
    recipient: startup.createdBy, type: 'qa_answer',
    title: `New investor question on ${startup.name}`,
    body: isAnonymous ? 'An anonymous investor has a question for you.' : question.substring(0, 80),
    link: `/communicate/${req.params.id}`,
    startup: req.params.id,
  });

  res.status(201).json({ success: true, data: msg });
});

// POST /api/v1/startups/:id/qa/:qid/answer — startup answers
exports.answerQuestion = catchAsync(async (req, res) => {
  const { answer } = req.body;
  if (!answer?.trim()) return apiError(res, 400, 'Answer text is required');

  const startup = await Startup.findById(req.params.id).select('createdBy name').lean();
  if (!startup) return apiError(res, 404, 'Startup not found');
  if (startup.createdBy.toString() !== req.user._id.toString()) {
    return apiError(res, 403, 'Only the startup owner can answer questions');
  }

  const msg = await Message.findOneAndUpdate(
    { _id: req.params.qid, startup: req.params.id, type: 'qa' },
    { answer: answer.trim(), answeredAt: new Date(), isAnswered: true },
    { new: true }
  ).populate('author', 'name');
  if (!msg) return apiError(res, 404, 'Question not found');

  // Notify original questioner (even if anonymous, we know their userId)
  await Notification.create({
    recipient: msg.author._id, type: 'qa_answer',
    title: `${startup.name} answered your question`,
    body: answer.substring(0, 100),
    link: `/communicate/${req.params.id}`,
    startup: req.params.id,
  });

  res.json({ success: true, data: msg });
});

// ══════════════════════════════════════════════════════════
// Announcements
// ══════════════════════════════════════════════════════════

// GET /api/v1/startups/:id/announcements
exports.listAnnouncements = catchAsync(async (req, res) => {
  const msgs = await Message.find({ startup: req.params.id, type: 'announcement' })
    .sort({ pinned: -1, createdAt: -1 })
    .populate('author', 'name')
    .lean();
  res.json({ success: true, count: msgs.length, data: msgs });
});

// POST /api/v1/startups/:id/announcements — startup posts update
exports.postAnnouncement = catchAsync(async (req, res) => {
  const { content, pinned } = req.body;
  if (!content?.trim()) return apiError(res, 400, 'Content is required');

  const startup = await Startup.findById(req.params.id).select('createdBy name').lean();
  if (!startup) return apiError(res, 404, 'Startup not found');
  if (startup.createdBy.toString() !== req.user._id.toString()) {
    return apiError(res, 403, 'Only the startup owner can post announcements');
  }

  const msg = await Message.create({
    type: 'announcement', startup: req.params.id,
    author: req.user._id, content: content.trim(),
    pinned: Boolean(pinned),
  });

  // Notify all investors
  await notifyInvestors(
    req.params.id, 'announcement',
    `📢 ${startup.name}: New Update`,
    content.substring(0, 100),
    `/communicate/${req.params.id}`
  );

  res.status(201).json({ success: true, data: msg });
});

// ══════════════════════════════════════════════════════════
// Milestone Comments
// ══════════════════════════════════════════════════════════

// GET /api/v1/startups/:id/milestones/:mid/comments
exports.listMilestoneComments = catchAsync(async (req, res) => {
  const msgs = await Message.find({
    startup: req.params.id,
    type: 'milestone_comment',
    milestoneId: req.params.mid,
  })
    .sort({ createdAt: 1 })
    .populate('author', 'name avatarUrl')
    .lean();
  res.json({ success: true, count: msgs.length, data: msgs });
});

// POST /api/v1/startups/:id/milestones/:mid/comments
exports.postMilestoneComment = catchAsync(async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) return apiError(res, 400, 'Comment content is required');

  const startup = await Startup.findById(req.params.id).select('milestones createdBy name').lean();
  if (!startup) return apiError(res, 404, 'Startup not found');

  const milestone = startup.milestones.find(m => m._id.toString() === req.params.mid);
  if (!milestone) return apiError(res, 404, 'Milestone not found');
  if (milestone.status !== 'submitted') {
    return apiError(res, 400, 'Comments are only open during the voting window (submitted status)');
  }

  const msg = await Message.create({
    type: 'milestone_comment', startup: req.params.id,
    milestoneId: req.params.mid, author: req.user._id,
    content: content.trim(),
  });

  // Increment comment count on milestone
  await Startup.updateOne(
    { _id: req.params.id, 'milestones._id': req.params.mid },
    { $inc: { 'milestones.$.commentCount': 1 } }
  );

  // Notify startup owner
  await Notification.create({
    recipient: startup.createdBy, type: 'milestone_comment',
    title: `New comment on milestone: ${milestone.title}`,
    body: content.substring(0, 80),
    link: `/milestones/${req.params.id}`,
    startup: req.params.id,
  });

  res.status(201).json({ success: true, data: msg });
});

// ══════════════════════════════════════════════════════════
// Notifications
// ══════════════════════════════════════════════════════════

// GET /api/v1/notifications
exports.getNotifications = catchAsync(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  const unreadCount = notifications.filter(n => !n.read).length;
  res.json({ success: true, unreadCount, data: notifications });
});

// PATCH /api/v1/notifications/:id/read
exports.markRead = catchAsync(async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { read: true }
  );
  res.json({ success: true });
});

// PATCH /api/v1/notifications/read-all
exports.markAllRead = catchAsync(async (req, res) => {
  await Notification.updateMany({ recipient: req.user._id, read: false }, { read: true });
  res.json({ success: true });
});
