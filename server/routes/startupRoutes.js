const express = require('express');
const router = express.Router();
const { getStartups, getStartup, createStartup, expressInterest } = require('../controllers/startupController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/',              getStartups);
router.get('/:id',           getStartup);
router.post('/:id/interest', expressInterest);
router.post('/',             restrictTo('admin'), createStartup);

module.exports = router;
