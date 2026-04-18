const User = require('../models/User');
const Startup = require('../models/Startup');
const generateToken = require('../utils/generateToken');

const register = async (req, res, next) => {
  try {
    const { name, email, password, role, organization, entityType, companyName, sector, fundingGoal, investmentFocus } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const validRole = ['investor', 'startup'].includes(role) ? role : 'investor';

    const userData = { name, email, password, role: validRole, organization, entityType };

    // Add role-specific fields
    if (validRole === 'startup') {
      if (companyName) userData.companyName = companyName;
      if (sector) userData.sector = sector;
      if (fundingGoal) userData.fundingGoal = fundingGoal;
    } else if (validRole === 'investor') {
      if (investmentFocus) userData.investmentFocus = investmentFocus;
    }

    const user = await User.create(userData);

    // Calculate initial profile score
    user.calculateProfileScore();
    await user.save();

    const token = generateToken(user._id, user.role);
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        entityType: user.entityType,
        kyc: user.kyc,
        profileComplete: user.profileComplete,
        profileCompletionScore: user.profileCompletionScore,
      },
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Recalculate profile score on login
    user.calculateProfileScore();
    await user.save();

    let effectiveProfileComplete = user.profileComplete;
    let effectiveProfileCompletionScore = user.profileCompletionScore;

    // Startup users complete profile through Startup profile wizard.
    if (user.role === 'startup') {
      const startupProfile = await Startup.findOne({ createdBy: user._id })
        .select('profileCompletionScore')
        .lean();
      if (startupProfile) {
        const startupScore = startupProfile.profileCompletionScore || 0;
        effectiveProfileCompletionScore = Math.max(effectiveProfileCompletionScore || 0, startupScore);
        effectiveProfileComplete = startupScore >= 70;
      }
    }

    const token = generateToken(user._id, user.role);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        organization: user.organization,
        entityType: user.entityType,
        kyc: user.kyc,
        profileComplete: effectiveProfileComplete,
        profileCompletionScore: effectiveProfileCompletionScore,
      },
    });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

const logout = (req, res) => {
  res.json({ success: true, message: 'Logged out.' });
};

module.exports = { register, login, getMe, logout };
