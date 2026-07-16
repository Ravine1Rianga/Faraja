const router = require('express').Router();
const D      = require('../controllers/donationController');
const { protect, optionalAuth } = require('../middleware/auth');

// M-PESA callback is public (Safaricom calls it)
router.post('/mpesa/callback', D.mpesaCallback);

// Donation endpoints
router.post('/',                    optionalAuth, D.createDonation);   // public + optionally link to user
router.get('/',                     protect, D.getAllContributions);   // admin: all contributions
router.get('/:funeralId',           protect, D.getDonations);
router.get('/:funeralId/report',    protect, D.financialReport);

module.exports = router;
