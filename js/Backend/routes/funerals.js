const router   = require('express').Router();
const F        = require('../controllers/funeralController');
const C        = require('../controllers/committeeController');
const T        = require('../controllers/taskController');
const E        = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');
const upload   = require('../middleware/upload');

// Funeral CRUD
router.post('/',              protect, upload.single('photo'), F.createFuneral);
router.get('/',               protect, F.getMyFunerals);
router.get('/public/active',  F.getActiveFunerals); // public — for donate page selector
router.get('/:id',            F.getFuneral); // public — controller handles privacy check
router.put('/:id',  protect, upload.single('photo'), F.updateFuneral);
router.delete('/:id', protect, F.deleteFuneral);

// Committee (nested under funeral)
router.get('/:funeralId/committee',              protect, C.getCommittee);
router.post('/:funeralId/committee',             protect, C.addMember);
router.put('/:funeralId/committee/:memberId',    protect, C.updateMember);
router.delete('/:funeralId/committee/:memberId', protect, C.removeMember);

// Tasks (nested under funeral)
router.get('/:funeralId/tasks',  protect, T.getTasks);
router.post('/:funeralId/tasks', protect, T.createTask);

// Expenses (nested under funeral)
router.get('/:funeralId/expenses',  protect, E.getExpenses);
router.post('/:funeralId/expenses', protect, E.createExpense);

// Dashboard summary (stats, top contributors, activity feed)
router.get('/:id/dashboard', protect, F.getDashboard);

module.exports = router;
