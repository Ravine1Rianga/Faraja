const bcrypt = require('bcryptjs');
const db     = require('../config/db');
const R      = require('../utils/response');

async function getProfile(req, res) {
  try {
    const [rows] = await db.query(
      'SELECT u.id, u.name, u.email, u.phone, u.profile_photo, u.created_at, r.name AS role FROM users u JOIN roles r ON r.id = u.role_id WHERE u.id = ?',
      [req.user.id]
    );
    if (!rows[0]) return R.notFound(res, 'User not found');
    return R.ok(res, { user: rows[0] });
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function updateProfile(req, res) {
  try {
    const { name, phone, currentPassword, newPassword } = req.body;
    const updates = [];
    const values  = [];

    if (name)  { updates.push('name = ?');  values.push(name); }
    if (phone) { updates.push('phone = ?'); values.push(phone); }

    if (req.file) {
      updates.push('profile_photo = ?');
      values.push(`/uploads/${req.file.filename}`);
    }

    if (newPassword) {
      if (!currentPassword) return R.fail(res, 'Current password required to set a new password');
      const [userRows] = await db.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
      const match = await bcrypt.compare(currentPassword, userRows[0].password_hash);
      if (!match) return R.fail(res, 'Current password is incorrect');
      updates.push('password_hash = ?');
      values.push(await bcrypt.hash(newPassword, 12));
    }

    if (!updates.length) return R.fail(res, 'Nothing to update');

    values.push(req.user.id);
    await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
    return R.ok(res, {}, 'Profile updated');
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function deleteProfile(req, res) {
  try {
    await db.query('UPDATE users SET is_active = 0 WHERE id = ?', [req.user.id]);
    return R.ok(res, {}, 'Account deactivated');
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function getMyContributions(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT c.id, c.funeral_id, c.contributor_name, c.amount, c.payment_method,
              c.message, c.is_anonymous, c.status, c.created_at,
              f.deceased_name,
              t.mpesa_code AS mpesa_ref, t.checkout_req_id AS transaction_id
       FROM contributions c
       JOIN funeral_projects f ON f.id = c.funeral_id
       LEFT JOIN transactions t ON t.contribution_id = c.id
       WHERE c.user_id = ?
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );
    return R.ok(res, { contributions: rows });
  } catch (err) {
    return R.serverError(res, err);
  }
}

module.exports = { getProfile, updateProfile, deleteProfile, getMyContributions };
