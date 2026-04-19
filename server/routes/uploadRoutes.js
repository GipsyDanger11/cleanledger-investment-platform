const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const registrationUpload = require('../middleware/uploadRegistration');
const { uploadRegistrationDocs, streamGridFSFile } = require('../controllers/uploadController');

router.post(
  '/registration',
  protect,
  restrictTo('startup', 'founder'),
  registrationUpload.fields([
    { name: 'businessRegistration', maxCount: 1 },
    { name: 'gstNumber', maxCount: 1 },
    { name: 'founderId', maxCount: 1 },
    { name: 'pitchDeck', maxCount: 1 },
    { name: 'bankStatement', maxCount: 1 },
  ]),
  uploadRegistrationDocs
);

router.get('/gridfs/:id', streamGridFSFile);

module.exports = router;
