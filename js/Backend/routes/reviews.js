const router = require('express').Router();
const R      = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.post('/',             protect, R.createReview);
router.get('/:vendorId',     R.getVendorReviews);
router.delete('/:id',        protect, R.deleteReview);

module.exports = router;
