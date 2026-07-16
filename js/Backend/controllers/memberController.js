const db = require('../config/db');
const R  = require('../utils/response');

async function requestJoin(req, res) {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;
    if (!name) return R.fail(res, 'Name is required to join');

    const [funeral] = await db.query('SELECT id, privacy FROM funeral_projects WHERE id = ?', [id]);
    if (!funeral[0]) return R.notFound(res, 'Memorial not found');

    const userId = req.user?.id || null;

    const [existing] = await db.query(
      'SELECT id, status FROM funeral_members WHERE funeral_id = ? AND (user_id = ? OR (name = ? AND email = ?))',
      [id, userId, name, email || null]
    );
    if (existing[0]) {
      if (existing[0].status === 'approved') return R.fail(res, 'You are already a member of this memorial');
      if (existing[0].status === 'pending') return R.fail(res, 'You already have a pending request');
      if (existing[0].status === 'rejected') return R.fail(res, 'Your previous request was declined');
    }

    const status = funeral[0].privacy === 'private' ? 'pending' : 'approved';
    const [result] = await db.query(
      'INSERT INTO funeral_members (funeral_id, user_id, name, email, phone, status) VALUES (?,?,?,?,?,?)',
      [id, userId, name, email || null, phone || null, status]
    );
    const [member] = await db.query('SELECT * FROM funeral_members WHERE id = ?', [result.insertId]);
    return R.created(res, { member: member[0] }, status === 'pending' ? 'Join request sent' : 'Joined memorial');
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function getMembers(req, res) {
  try {
    const { id } = req.params;
    const [members] = await db.query(
      "SELECT * FROM funeral_members WHERE funeral_id = ? AND status = 'approved' ORDER BY created_at DESC",
      [id]
    );
    return R.ok(res, { members });
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function getJoinRequests(req, res) {
  try {
    const { id } = req.params;
    const [funeral] = await db.query('SELECT created_by FROM funeral_projects WHERE id = ?', [id]);
    if (!funeral[0]) return R.notFound(res, 'Memorial not found');
    if (funeral[0].created_by !== req.user.id) return R.forbidden(res);

    const [requests] = await db.query(
      "SELECT * FROM funeral_members WHERE funeral_id = ? AND status = 'pending' ORDER BY created_at DESC",
      [id]
    );
    return R.ok(res, { requests });
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function updateMemberStatus(req, res) {
  try {
    const { id, memberId } = req.params;
    const { status } = req.body;
    if (!status || !['approved', 'rejected'].includes(status)) {
      return R.fail(res, 'Status must be approved or rejected');
    }

    const [funeral] = await db.query('SELECT created_by FROM funeral_projects WHERE id = ?', [id]);
    if (!funeral[0]) return R.notFound(res, 'Memorial not found');
    if (funeral[0].created_by !== req.user.id) return R.forbidden(res);

    await db.query('UPDATE funeral_members SET status = ? WHERE id = ? AND funeral_id = ?', [status, memberId, id]);
    const [member] = await db.query('SELECT * FROM funeral_members WHERE id = ?', [memberId]);
    return R.ok(res, { member: member[0] }, `Member ${status}`);
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function removeMember(req, res) {
  try {
    const { id, memberId } = req.params;
    const [funeral] = await db.query('SELECT created_by FROM funeral_projects WHERE id = ?', [id]);
    if (!funeral[0]) return R.notFound(res, 'Memorial not found');
    if (funeral[0].created_by !== req.user.id) return R.forbidden(res);

    await db.query('DELETE FROM funeral_members WHERE id = ? AND funeral_id = ?', [memberId, id]);
    return R.ok(res, {}, 'Member removed');
  } catch (err) {
    return R.serverError(res, err);
  }
}

module.exports = { requestJoin, getMembers, getJoinRequests, updateMemberStatus, removeMember };
