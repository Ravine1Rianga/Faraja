const router = require('express').Router();
const T      = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

// Individual task operations (by task ID, not funeral ID)
router.put('/:taskId',          protect, T.updateTask);
router.patch('/:taskId/complete', protect, T.completeTask);
router.delete('/:taskId',       protect, T.deleteTask);

module.exports = router;
