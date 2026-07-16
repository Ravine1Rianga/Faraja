const router   = require('express').Router();
const F        = require('../controllers/funeralController');
const C        = require('../controllers/committeeController');
const T        = require('../controllers/taskController');
const E        = require('../controllers/expenseController');
const { protect, optionalAuth, authorize } = require('../middleware/auth');
const upload   = require('../middleware/upload');

// Funeral CRUD
router.post('/',              protect, upload.single('photo'), F.createFuneral);
router.get('/',               protect, F.getMyFunerals);
router.get('/public/active',  optionalAuth, F.getActiveFunerals); // public + includes user's private
router.get('/:id',            optionalAuth, F.getFuneral); // public + optionally auth for private
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

// Public memorial / tribute page (no auth)
router.get('/:id/public',   F.getPublicMemorial);

// Print-friendly memorial data
router.get('/:id/print',    protect, F.printMemorial);

// Premium tier upgrade (admin only)
router.post('/:id/upgrade', protect, authorize('admin'), F.upgradeTier);

// Announce / diaspora notification (stub)
router.post('/:id/announce', protect, F.announceFuneral);

module.exports = router;
