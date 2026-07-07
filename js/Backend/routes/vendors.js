const router = require('express').Router();
const V      = require('../controllers/vendorController');
const P      = require('../controllers/productController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

// Public
router.get('/active', optionalAuth, V.getActiveVendors);

// Protected — vendor's own profile
router.get('/me',     protect, V.getMyVendorProfile);
router.post('/',      protect, V.createVendor);

// Admin or vendor owner
router.get('/',       protect, V.getVendors);
router.get('/:id',    protect, V.getVendor);
router.put('/:id',    protect, V.updateVendor);
router.delete('/:id', protect, V.deleteVendor);

// Products nested under vendor
router.get('/:vendorId/products',         optionalAuth, P.getProducts);
router.post('/:vendorId/products',        protect, P.createProduct);
router.put('/:vendorId/products/:id',     protect, P.updateProduct);
router.delete('/:vendorId/products/:id',  protect, P.deleteProduct);

module.exports = router;
