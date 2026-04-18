const express    = require('express');
const router     = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { invest, listInvestments, fheAggregate } = require('../controllers/investmentController');
const { getWallet, topUpWallet } = require('../controllers/walletController');

// GET  /api/v1/investments         — investor's portfolio
router.get('/',       protect, listInvestments);

// GET  /api/v1/investments/wallet  — virtual wallet balance
router.get('/wallet',       protect, getWallet);

// POST /api/v1/investments/wallet/topup  — top-up virtual wallet
router.post('/wallet/topup', protect, topUpWallet);

// POST /api/v1/investments         — place an investment (investor only)
router.post('/',            protect, restrictTo('investor'), invest);

// GET  /api/v1/investments/fhe-aggregate/:startupId  — homomorphic sum without decrypting individuals
router.get('/fhe-aggregate/:startupId', protect, fheAggregate);

module.exports = router;
