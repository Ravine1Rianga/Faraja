const router = require('express').Router();
const M = require('../controllers/memberController');
const { protect, optionalAuth } = require('../middleware/auth');

router.post('/:id/join', optionalAuth, M.requestJoin);
router.get('/:id/members', protect, M.getMembers);
router.get('/:id/requests', protect, M.getJoinRequests);
router.put('/:id/members/:memberId', protect, M.updateMemberStatus);
router.delete('/:id/members/:memberId', protect, M.removeMember);

module.exports = router;
