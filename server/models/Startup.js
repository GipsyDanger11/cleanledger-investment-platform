const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  phase:       { type: String, required: true },
  title:       { type: String, required: true },
  description: String,
  status:      { type: String, enum: ['pending', 'in_progress', 'complete'], default: 'pending' },
  daoVoteRequired: { type: Boolean, default: false },
  daoVoteStatus:   { type: String, enum: ['none', 'open', 'passed', 'failed'], default: 'none' },
  completedAt: Date,
});

const startupSchema = new mongoose.Schema(
  {
    name:          { type: String, required: true, trim: true },
    sector:        { type: String, required: true },
    geography:     { type: String, required: true },
    description:   { type: String, required: true },
    tags:          [String],
    fundingTarget: { type: Number, required: true },
    totalRaised:   { type: Number, default: 0 },
    backers:       { type: Number, default: 0 },
    trustScore:    { type: Number, default: 0, min: 0, max: 100 },
    esgScore:      { type: Number, default: 0, min: 0, max: 100 },
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
    milestones: [milestoneSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Startup', startupSchema);
