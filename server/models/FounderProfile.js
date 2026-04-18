const mongoose = require('mongoose');

/**
 * Founder personal narrative (separate from Startup company record).
 * Gating for "profile complete" remains Startup.profileCompletionScore >= 70.
 */
const founderProfileSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    startup: { type: mongoose.Schema.Types.ObjectId, ref: 'Startup', required: true },

    founderTitle: { type: String, trim: true },
    founderLinkedIn: { type: String, trim: true },
    founderMissionStatement: { type: String, trim: true, maxlength: 2000 },
    leadershipExperienceYears: { type: Number, min: 0 },
    operatorBackground: { type: String, trim: true, maxlength: 2000 },
    priorExitsOrAdvisory: { type: String, trim: true, maxlength: 2000 },
  },
  { timestamps: true }
);

founderProfileSchema.post('save', async function () {
  const User = mongoose.model('User');
  const Startup = mongoose.model('Startup');
  const st = await Startup.findById(this.startup).select('profileCompletionScore').lean();
  const stScore = st?.profileCompletionScore || 0;
  await User.findByIdAndUpdate(this.user, {
    profileCompletionScore: stScore,
    profileComplete: true, // Mark complete unconditionally when reaching end of wizard
  });
});

module.exports = mongoose.model('FounderProfile', founderProfileSchema);
