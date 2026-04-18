const express = require('express');
const router = express.Router();
const { updateProfile, getProfileScore } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

router.put('/complete', protect, updateProfile);
router.get('/score',    protect, getProfileScore);

module.exports = router;
