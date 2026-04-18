const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const registrationUpload = require('../middleware/uploadRegistration');
const { uploadRegistrationDocs } = require('../controllers/uploadController');

router.post(
  '/registration',
  protect,
  restrictTo('startup'),
  registrationUpload.fields([
    { name: 'incorporationProof', maxCount: 1 },
    { name: 'pitchDeck', maxCount: 1 },
    { name: 'businessPlan', maxCount: 1 },
  ]),
  uploadRegistrationDocs
);

module.exports = router;
