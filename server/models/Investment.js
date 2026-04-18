const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema(
  {
    investor:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startup:       { type: mongoose.Schema.Types.ObjectId, ref: 'Startup', required: true },
    startupName:   String,
    sector:        String,
    amount:        { type: Number, required: true },
    currency:      { type: String, default: 'USD' },
    trancheStatus: { type: String, default: 'Phase 1 — In Progress' },
    trustScore:    { type: Number, default: 0 },
    status:        { type: String, enum: ['active', 'exited', 'pending'], default: 'active' },
    date:          { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Investment', investmentSchema);
