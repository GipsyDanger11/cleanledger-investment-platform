const FounderProfile = require('../models/FounderProfile');
const Startup = require('../models/Startup');

const FOUNDER_FIELDS = [
  'founderTitle',
  'founderLinkedIn',
  'founderMissionStatement',
  'leadershipExperienceYears',
  'operatorBackground',
  'priorExitsOrAdvisory',
];

exports.getMy = async (req, res, next) => {
  try {
    const doc = await FounderProfile.findOne({ user: req.user._id }).populate('startup').lean();
    if (!doc) {
      return res.json({ success: true, data: null });
    }
    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
};

exports.putMy = async (req, res, next) => {
  try {
    let doc = await FounderProfile.findOne({ user: req.user._id });
    if (!doc) {
      const startup = await Startup.findOne({ createdBy: req.user._id });
      if (!startup) {
        return res.status(400).json({
          success: false,
          message: 'Create your startup profile first.',
        });
      }
      doc = new FounderProfile({ user: req.user._id, startup: startup._id });
    }
    for (const key of FOUNDER_FIELDS) {
      if (req.body[key] !== undefined) doc[key] = req.body[key];
    }
    await doc.save();
    res.json({ success: true, data: doc });
  } catch (err) {
    next(err);
  }
};
