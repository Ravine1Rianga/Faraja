const router = require('express').Router();
const E      = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');

// Individual expense operations (by expense ID, not funeral ID)
router.put('/:expenseId',    protect, E.updateExpense);
router.delete('/:expenseId', protect, E.deleteExpense);

module.exports = router;
