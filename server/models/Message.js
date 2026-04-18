const mongoose = require('mongoose');

// ── Message Schema (G3) ──────────────────────────────────
const messageSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['qa', 'announcement', 'milestone_comment'],
      required: true,
    },
    startup:    { type: mongoose.Schema.Types.ObjectId, ref: 'Startup', required: true },
    author:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Q&A
    isAnonymous: { type: Boolean, default: false },
    question:    String,
    answer:      { type: String, default: '' },
    answeredAt:  Date,
    isAnswered:  { type: Boolean, default: false },

    // Announcement / milestone comment
    content:     String,
    milestoneId: String,  // for milestone_comment type

    // Engagement
    pinned:  { type: Boolean, default: false },
    likes:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likeCount:{ type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
