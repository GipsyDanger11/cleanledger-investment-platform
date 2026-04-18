const User = require('../models/User');

/**
 * PUT /api/v1/profile/complete
 * Updates the user's profile fields and recalculates the completion score.
 */
const updateProfile = async (req, res, next) => {
  try {
    const allowedFields = [
      'name', 'bio', 'avatarUrl', 'linkedIn', 'phone', 'organization',
      'companyName', 'sector', 'fundingGoal', 'stage', 'teamSize', 'website', 'pitchDeck',
      'milestones', 'teamMembers',
      'investmentFocus', 'minTicket', 'maxTicket', 'portfolioSize',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    // Recalculate profile score
    const score = user.calculateProfileScore();
    await user.save();

    res.json({
      success: true,
      profileCompletionScore: score,
      profileComplete: user.profileComplete,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileCompletionScore: user.profileCompletionScore,
        profileComplete: user.profileComplete,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/profile/score
 * Returns the current profile completion score.
 */
const getProfileScore = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const score = user.calculateProfileScore();
    await user.save();

    res.json({
      success: true,
      profileCompletionScore: score,
      profileComplete: user.profileComplete,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { updateProfile, getProfileScore };
