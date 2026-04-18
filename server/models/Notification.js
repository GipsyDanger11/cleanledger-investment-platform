const mongoose = require('mongoose');

// ── Notification Schema (G3) ─────────────────────────────
const notificationSchema = new mongoose.Schema(
  {
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: [
        'milestone_update', 'vote_request', 'qa_answer',
        'fund_release', 'announcement', 'variance_alert',
        'milestone_comment', 'trust_score_change',
      ],
      required: true,
    },
    title:   { type: String, required: true },
    body:    String,
    link:    String,       // frontend route to navigate to
    read:    { type: Boolean, default: false },
    startup: { type: mongoose.Schema.Types.ObjectId, ref: 'Startup' },
    meta:    { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Always sort by newest
notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
