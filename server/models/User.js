const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:     { type: String, required: true, minlength: 8, select: false },
    role:         { type: String, enum: ['investor', 'admin'], default: 'investor' },
    organization: { type: String, trim: true },
    entityType:   { type: String, enum: ['individual', 'company', 'fund', 'spv'], default: 'individual' },
    kyc: {
      status:      { type: String, enum: ['pending', 'in_review', 'verified', 'rejected'], default: 'pending' },
      submittedAt: Date,
      verifiedAt:  Date,
      documents:   [{ name: String, url: String, uploadedAt: Date }],
    },
    wallet: { type: String, default: null },
    notifications: [{
      message:   String,
      icon:      String,
      read:      { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
    }],
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
