const mongoose = require('mongoose');

const auditEntrySchema = new mongoose.Schema(
  {
    blockNumber:  { type: Number, required: true, unique: true },
    type: {
      type: String,
      enum: ['capital_release', 'funding_allocation', 'inter_account', 'kyb_verified', 'dao_vote', 'milestone_complete', 'investment'],
      required: true,
    },
    fromEntity:   { type: String, required: true },
    toEntity:     { type: String, required: true },
    amount:       { type: Number, default: 0 },
    currency:     { type: String, default: 'INR' },
    hash:         { type: String, required: true, unique: true },
    previousHash: { type: String, required: true },
    status:       { type: String, enum: ['confirmed', 'pending', 'failed'], default: 'confirmed' },
    startup:      { type: mongoose.Schema.Types.ObjectId, ref: 'Startup' },
    investment:   { type: mongoose.Schema.Types.ObjectId, ref: 'Investment' },
    initiatedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    metadata:     { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Immutability guard
auditEntrySchema.pre(['updateOne', 'findOneAndUpdate', 'updateMany'], function () {
  throw new Error('Audit entries are immutable and cannot be modified.');
});

module.exports = mongoose.model('AuditEntry', auditEntrySchema);
