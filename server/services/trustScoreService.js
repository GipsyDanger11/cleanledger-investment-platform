const computeTrustScore = ({ verificationStatus, esgScore = 0, totalRaised = 0, fundingTarget = 1, milestones = [] }) => {
  const kybMap = { verified: 30, in_review: 15, unverified: 0, rejected: 0 };
  const kybPoints = kybMap[verificationStatus] ?? 0;
  const esgPoints = Math.min(esgScore, 100) * 0.25;
  const fundingRatio = fundingTarget > 0 ? Math.min(totalRaised / fundingTarget, 1) : 0;
  const fundingPoints = fundingRatio * 25;
  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter((m) => m.status === 'complete').length;
  const milestonePoints = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 20 : 0;
  return Math.round(Math.min(Math.max(kybPoints + esgPoints + fundingPoints + milestonePoints, 0), 100));
};

module.exports = { computeTrustScore };
