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

// ── Admin: list all users ─────────────────────────────────────
async function getAllUsers(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.name, u.email, u.phone, u.is_active AS status, u.created_at,
              r.name AS role
       FROM users u JOIN roles r ON r.id = u.role_id
       ORDER BY u.created_at DESC`
    );
    const users = rows.map(u => ({ ...u, status: u.status ? 'active' : 'suspended', createdAt: u.created_at }));
    return R.ok(res, { users });
  } catch (err) {
    return R.serverError(res, err);
  }
}

// ── Admin: update any user ────────────────────────────────────
async function adminUpdateUser(req, res) {
  try {
    const { name, role, status } = req.body;
    const userId = req.params.id;

    const [existing] = await db.query('SELECT id FROM users WHERE id = ?', [userId]);
    if (!existing[0]) return R.notFound(res, 'User not found');

    if (name) {
      await db.query('UPDATE users SET name = ? WHERE id = ?', [name, userId]);
    }

    if (role) {
      const [roleRows] = await db.query('SELECT id FROM roles WHERE name = ?', [role]);
      if (roleRows[0]) {
        await db.query('UPDATE users SET role_id = ? WHERE id = ?', [roleRows[0].id, userId]);
      }
    }

    if (status) {
      const isActive = status === 'active' ? 1 : 0;
      await db.query('UPDATE users SET is_active = ? WHERE id = ?', [isActive, userId]);
    }

    const [user] = await db.query(
      'SELECT u.id, u.name, u.email, u.phone, u.is_active AS status, u.created_at, r.name AS role FROM users u JOIN roles r ON r.id = u.role_id WHERE u.id = ?',
      [userId]
    );
    return R.ok(res, { user: { ...user[0], status: user[0].status ? 'active' : 'suspended' } }, 'User updated');
  } catch (err) {
    return R.serverError(res, err);
  }
}

// ── Admin: delete any user ────────────────────────────────────
async function adminDeleteUser(req, res) {
  try {
    const [existing] = await db.query('SELECT id FROM users WHERE id = ?', [req.params.id]);
    if (!existing[0]) return R.notFound(res, 'User not found');
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    return R.ok(res, {}, 'User deleted');
  } catch (err) {
    return R.serverError(res, err);
  }
}

// ── Admin: platform metrics ──────────────────────────────────
async function getAdminMetrics(req, res) {
  try {
    const [[userCount]]        = await db.query('SELECT COUNT(*) AS count FROM users');
    const [[vendorCount]]      = await db.query('SELECT COUNT(*) AS count FROM vendors WHERE status = \'active\'');
    const [[memorialCount]]    = await db.query('SELECT COUNT(*) AS count FROM funeral_projects WHERE status = \'active\'');
    const [[raisedTotal]]      = await db.query('SELECT COALESCE(SUM(raised),0) AS total FROM funeral_projects');
    const [[platformFees]]     = await db.query('SELECT COALESCE(SUM(platform_fee),0) AS total FROM contributions WHERE status = \'confirmed\'');
    const [[bookingSummary]]   = await db.query('SELECT COALESCE(SUM(amount),0) AS gmv, COALESCE(SUM(commission_amount),0) AS commissions FROM bookings WHERE status = \'completed\'');
    const [[bookingCount]]     = await db.query('SELECT COUNT(*) AS count FROM bookings');
    const [[contribCount]]     = await db.query('SELECT COUNT(*) AS count FROM contributions WHERE status = \'confirmed\'');

    return R.ok(res, {
      metrics: {
        totalUsers: userCount.count,
        activeVendors: vendorCount.count,
        activeMemorials: memorialCount.count,
        totalRaised: raisedTotal.total,
        platformRevenue: Number(platformFees.total) + Number(bookingSummary.commissions),
        bookingGmv: bookingSummary.gmv,
        bookingCommissions: bookingSummary.commissions,
        totalBookings: bookingCount.count,
        confirmedContributions: contribCount.count,
      },
    });
  } catch (err) {
    return R.serverError(res, err);
  }
}

module.exports = { getProfile, updateProfile, deleteProfile, getMyContributions, getAllUsers, adminUpdateUser, adminDeleteUser, getAdminMetrics };
