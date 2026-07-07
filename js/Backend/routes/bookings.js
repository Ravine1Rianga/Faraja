const router = require('express').Router();
const B      = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.post('/',            protect, B.createBooking);
router.get('/funeral/:funeralId', protect, B.getFuneralBookings);
router.get('/vendor',       protect, authorize('vendor','admin'), B.getVendorBookings);
router.get('/admin',        protect, authorize('admin'), B.getAllBookings);
router.patch('/:id/status', protect, B.updateBookingStatus);

module.exports = router;
