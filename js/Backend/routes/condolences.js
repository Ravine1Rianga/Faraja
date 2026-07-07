const router = require('express').Router();
const C      = require('../controllers/condolenceController');
const { protect, optionalAuth } = require('../middleware/auth');

router.post('/',          C.createCondolence);
router.get('/:funeralId', C.getCondolences);
router.delete('/:id',     protect, C.deleteCondolence);

module.exports = router;
