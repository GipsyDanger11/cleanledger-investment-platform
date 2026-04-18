/**
 * POST /api/v1/uploads/registration
 * Multipart fields: incorporationProof, pitchDeck, businessPlan (each optional, max 1 file).
 */
exports.uploadRegistrationDocs = (req, res) => {
  const files = req.files || {};
  const urls = {};

  const rel = (f) => `/uploads/reg/${f.filename}`;

  if (files.incorporationProof?.[0]) urls.incorporationProofUrl = rel(files.incorporationProof[0]);
  if (files.pitchDeck?.[0]) urls.pitchDeckUrl = rel(files.pitchDeck[0]);
  if (files.businessPlan?.[0]) urls.businessPlanUrl = rel(files.businessPlan[0]);

  res.json({ success: true, urls });
};
