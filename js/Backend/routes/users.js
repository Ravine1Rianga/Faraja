const router = require('express').Router();
const { getProfile, updateProfile, deleteProfile, getMyContributions } = require('../controllers/userController');
const { protect }  = require('../middleware/auth');
const upload       = require('../middleware/upload');

router.get('/',              protect, getProfile);
router.get('/contributions', protect, getMyContributions);
router.put('/',              protect, upload.single('profilePhoto'), updateProfile);
router.delete('/',           protect, deleteProfile);

module.exports = router;
