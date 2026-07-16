const router = require('express').Router();
const { getProfile, updateProfile, deleteProfile, getMyContributions, getAllUsers, adminUpdateUser, adminDeleteUser, getAdminMetrics } = require('../controllers/userController');
const { protect, authorize }  = require('../middleware/auth');
const upload       = require('../middleware/upload');

// User's own profile
router.get('/profile',              protect, getProfile);
router.get('/profile/contributions', protect, getMyContributions);
router.put('/profile',              protect, upload.single('profilePhoto'), updateProfile);
router.delete('/profile',           protect, deleteProfile);

// Admin: manage all users
router.get('/all',          protect, authorize('admin'), getAllUsers);
router.get('/admin/metrics', protect, authorize('admin'), getAdminMetrics);
router.put('/:id',          protect, authorize('admin'), adminUpdateUser);
router.delete('/:id',       protect, authorize('admin'), adminDeleteUser);

module.exports = router;
