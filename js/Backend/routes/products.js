const router = require('express').Router();
const P      = require('../controllers/productController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

router.get('/active', optionalAuth, P.getActiveProducts);
router.get('/',       protect, P.getProducts);      // all products (admin)
router.get('/:id',    optionalAuth, P.getProduct);
router.delete('/:id', protect, P.deleteProduct);   // owner or admin

module.exports = router;
