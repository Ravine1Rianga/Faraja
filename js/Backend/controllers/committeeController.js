const db = require('../config/db');
const R  = require('../utils/response');

async function ownsOrCommittee(funeralId, userId) {
  const [rows] = await db.query(
    'SELECT created_by FROM funeral_projects WHERE id = ?', [funeralId]
  );
  return rows[0] && rows[0].created_by === userId;
}

async function getCommittee(req, res) {
  try {
    const [members] = await db.query(
      'SELECT * FROM committee_members WHERE funeral_id = ? ORDER BY joined_at ASC',
      [req.params.funeralId]
    );
    return R.ok(res, { members });
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function addMember(req, res) {
  try {
    const { funeralId } = req.params;
    if (!await ownsOrCommittee(funeralId, req.user.id)) return R.forbidden(res);

    const { name, phone, email, location, role } = req.body;
    if (!name) return R.fail(res, 'Member name is required');

    const [result] = await db.query(
      'INSERT INTO committee_members (funeral_id, name, phone, email, location, committee_role) VALUES (?,?,?,?,?,?)',
      [funeralId, name, phone || null, email || null, location || null, role || null]
    );
    const [rows] = await db.query('SELECT * FROM committee_members WHERE id = ?', [result.insertId]);
    return R.created(res, { member: rows[0] }, 'Member added');
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function updateMember(req, res) {
  try {
    const { funeralId, memberId } = req.params;
    if (!await ownsOrCommittee(funeralId, req.user.id)) return R.forbidden(res);

    const { name, phone, email, location, role } = req.body;
    await db.query(
      `UPDATE committee_members SET
         name           = COALESCE(?, name),
         phone          = COALESCE(?, phone),
         email          = COALESCE(?, email),
         location       = COALESCE(?, location),
         committee_role = COALESCE(?, committee_role)
       WHERE id = ? AND funeral_id = ?`,
      [name || null, phone || null, email || null, location || null, role || null, memberId, funeralId]
    );
    return R.ok(res, {}, 'Member updated');
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function removeMember(req, res) {
  try {
    const { funeralId, memberId } = req.params;
    if (!await ownsOrCommittee(funeralId, req.user.id)) return R.forbidden(res);

    await db.query('DELETE FROM committee_members WHERE id = ? AND funeral_id = ?', [memberId, funeralId]);
    return R.ok(res, {}, 'Member removed');
  } catch (err) {
    return R.serverError(res, err);
  }
}

module.exports = { getCommittee, addMember, updateMember, removeMember };
