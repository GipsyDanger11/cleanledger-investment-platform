const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema(
  {
    investor:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startup:       { type: mongoose.Schema.Types.ObjectId, ref: 'Startup', required: true },
    startupName:   String,
    sector:        String,
    amount:        { type: Number, required: true },
    currency:      { type: String, default: 'INR' },   // Virtual wallet uses INR

    // ── Blockchain linkage ──────────────────────────────────────
    blockHash:     { type: String, default: '' },       // SHA-256 hash of the chain block for this txn

    // R2 — tranche tagging
    trancheTag:    { type: String, default: '' },       // e.g. "Milestone 1 — MVP Launch"
    investorIdHash:{ type: String, default: '' },       // anonymised investor ID for public audit
    trancheStatus: { type: String, default: 'Phase 1 — In Progress' },
    trustScore:    { type: Number, default: 0 },
    status:        { type: String, enum: ['active', 'exited', 'pending'], default: 'active' },
    date:          { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Investment', investmentSchema);
