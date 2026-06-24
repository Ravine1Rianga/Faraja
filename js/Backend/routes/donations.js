const router = require('express').Router();
const D      = require('../controllers/donationController');
const { protect } = require('../middleware/auth');

// M-PESA callback is public (Safaricom calls it)
router.post('/mpesa/callback', D.mpesaCallback);

// Donation endpoints
router.post('/',                    D.createDonation);          // public — guests can donate
router.get('/:funeralId',           protect, D.getDonations);
router.get('/:funeralId/report',    protect, D.financialReport);

module.exports = router;
