const User = require('../models/User');
const Startup = require('../models/Startup');
const InvestorProfile = require('../models/InvestorProfile');
const generateToken = require('../utils/generateToken');
const { ticketsFromInvestmentRange } = require('../utils/registrationMappers');
const { ensureInvestorProfile, ensureFounderProfile } = require('../utils/ensureRoleProfiles');

const register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role,
      organization,
      entityType,
      investmentFocus,
      investmentRange,
      linkedIn,
      phone,
      accreditationStatus,
    } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already registered.' });
    }

    const validRole = ['investor', 'startup'].includes(role) ? role : 'investor';

    const user = await User.create({
      name,
      email,
      password,
      role: validRole,
    });

    if (validRole === 'investor') {
      const { minTicket, maxTicket } = ticketsFromInvestmentRange(investmentRange);
      const inv = new InvestorProfile({
        user: user._id,
        organization: (organization && String(organization).trim()) || '',
        entityType: (entityType && String(entityType).trim()) || 'individual',
        investmentFocus: investmentFocus ? String(investmentFocus).trim() : '',
        investmentRange: investmentRange ? String(investmentRange).trim() : '',
        linkedIn: linkedIn ? String(linkedIn).trim() : '',
        phone: phone ? String(phone).trim() : '',
        accreditationStatus: accreditationStatus ? String(accreditationStatus).trim() : '',
        minTicket,
        maxTicket,
      });
      inv.recalculateCompletion();
      await inv.save();
    } else {
      await User.findByIdAndUpdate(user._id, {
        profileComplete: false,
        profileCompletionScore: 0,
      });
    }

    const fresh = await User.findById(user._id);
    const token = generateToken(user._id, user.role);
    res.status(201).json({
      success: true,
      token,
      user: {
        id: fresh._id,
        name: fresh.name,
        email: fresh.email,
        role: fresh.role,
        organization: fresh.organization,
        entityType: fresh.entityType,
        kyc: fresh.kyc,
        profileComplete: fresh.profileComplete,
        profileCompletionScore: fresh.profileCompletionScore,
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

    let effectiveProfileComplete = user.profileComplete;
    let effectiveProfileCompletionScore = user.profileCompletionScore;
    let organization = user.organization;
    let entityType = user.entityType;

    if (user.role === 'investor') {
      await ensureInvestorProfile(user);
      const inv = await InvestorProfile.findOne({ user: user._id }).lean();
      if (inv) {
        effectiveProfileComplete = inv.profileComplete;
        effectiveProfileCompletionScore = inv.profileCompletionScore;
        organization = inv.organization;
        entityType = inv.entityType;
      }
    } else if (user.role === 'startup') {
      await ensureFounderProfile(user);
      const startupProfile = await Startup.findOne({ createdBy: user._id })
        .select('profileCompletionScore')
        .lean();
      if (startupProfile) {
        const startupScore = startupProfile.profileCompletionScore || 0;
        effectiveProfileCompletionScore = Math.max(effectiveProfileCompletionScore || 0, startupScore);
        effectiveProfileComplete = startupScore >= 70;
      } else {
        effectiveProfileComplete = false;
        effectiveProfileCompletionScore = 0;
      }
    } else {
      user.calculateProfileScore();
      await user.save();
      effectiveProfileComplete = user.profileComplete;
      effectiveProfileCompletionScore = user.profileCompletionScore;
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
        organization,
        entityType,
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
  let effectiveProfileComplete = req.user.profileComplete;
  let effectiveProfileCompletionScore = req.user.profileCompletionScore;
  let organization = req.user.organization;
  let entityType = req.user.entityType;

  if (req.user.role === 'investor') {
    await ensureInvestorProfile(req.user);
    const inv = await InvestorProfile.findOne({ user: req.user._id }).lean();
    if (inv) {
      effectiveProfileComplete = inv.profileComplete;
      effectiveProfileCompletionScore = inv.profileCompletionScore;
      organization = inv.organization;
      entityType = inv.entityType;
    }
  } else if (req.user.role === 'startup') {
    await ensureFounderProfile(req.user);
    const startupProfile = await Startup.findOne({ createdBy: req.user._id })
      .select('profileCompletionScore')
      .lean();
    if (startupProfile) {
      const startupScore = startupProfile.profileCompletionScore || 0;
      effectiveProfileCompletionScore = Math.max(effectiveProfileCompletionScore || 0, startupScore);
      effectiveProfileComplete = startupScore >= 70;
    } else {
      effectiveProfileComplete = false;
      effectiveProfileCompletionScore = 0;
    }
  }

  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      organization,
      entityType,
      kyc: req.user.kyc,
      profileComplete: effectiveProfileComplete,
      profileCompletionScore: effectiveProfileCompletionScore,
    },
  });
};

const logout = (req, res) => {
  res.json({ success: true, message: 'Logged out.' });
};

module.exports = { register, login, getMe, logout };
