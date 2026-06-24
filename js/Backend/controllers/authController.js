const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const crypto = require('crypto');
const db     = require('../config/db');
const R      = require('../utils/response');

function signToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role_id: user.role_id, role: user.role_name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

async function register(req, res) {
  try {
    const { name, email, phone, password, role = 'family' } = req.body;
    if (!name || !email || !password) return R.fail(res, 'Name, email and password are required');

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing[0]) return R.fail(res, 'Email already registered');

    const password_hash = await bcrypt.hash(password, 12);
    const [roleRows] = await db.query('SELECT id FROM roles WHERE name = ?', [role]);
    const role_id = roleRows[0]?.id || 2;

    const [result] = await db.query(
      'INSERT INTO users (name, email, phone, password_hash, role_id) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone || null, password_hash, role_id]
    );

    const [userRows] = await db.query(
      'SELECT u.*, r.name AS role_name FROM users u JOIN roles r ON r.id = u.role_id WHERE u.id = ?',
      [result.insertId]
    );

    // Welcome email (best-effort — won't block registration if it fails)
    try {
      const { sendWelcome } = require('../utils/email');
      await sendWelcome(email, name);
    } catch (_) { /* email not configured */ }

    return R.created(res, { token: signToken(userRows[0]), user: safeUser(userRows[0]) }, 'Account created');
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return R.fail(res, 'Email and password are required');

    const [rows] = await db.query(
      'SELECT u.*, r.name AS role_name FROM users u JOIN roles r ON r.id = u.role_id WHERE u.email = ?',
      [email]
    );
    if (!rows[0]) return R.unauthorized(res, 'Invalid email or password');

    const user = rows[0];
    if (!user.is_active) return R.unauthorized(res, 'Account suspended. Contact support.');

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return R.unauthorized(res, 'Invalid email or password');

    return R.ok(res, { token: signToken(user), user: safeUser(user) }, 'Login successful');
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) return R.fail(res, 'Email is required');

    const [rows] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (!rows[0]) return R.ok(res, {}, 'If that email exists, a reset link has been sent');

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000);

    await db.query(
      'INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)',
      [rows[0].id, token, expires]
    );

    const resetUrl = `${process.env.CLIENT_URL}/reset-password.html?token=${token}`;

    try {
      const { sendPasswordReset } = require('../utils/email');
      await sendPasswordReset(email, resetUrl);
    } catch (mailErr) {
      console.warn('[EMAIL] Failed to send reset email:', mailErr.message);
    }

    return R.ok(res, {}, 'If that email exists, a reset link has been sent');
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function resetPassword(req, res) {
  try {
    const { token, password } = req.body;
    if (!token || !password) return R.fail(res, 'Token and new password are required');

    const [rows] = await db.query(
      'SELECT * FROM password_resets WHERE token = ? AND used = 0 AND expires_at > NOW()',
      [token]
    );
    if (!rows[0]) return R.fail(res, 'Reset link is invalid or has expired');

    const password_hash = await bcrypt.hash(password, 12);
    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [password_hash, rows[0].user_id]);
    await db.query('UPDATE password_resets SET used = 1 WHERE id = ?', [rows[0].id]);

    return R.ok(res, {}, 'Password reset successfully');
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function me(req, res) {
  try {
    const [rows] = await db.query(
      'SELECT u.*, r.name AS role_name FROM users u JOIN roles r ON r.id = u.role_id WHERE u.id = ?',
      [req.user.id]
    );
    if (!rows[0]) return R.notFound(res, 'User not found');
    return R.ok(res, { user: safeUser(rows[0]) });
  } catch (err) {
    return R.serverError(res, err);
  }
}

function safeUser(u) {
  const { password_hash, ...safe } = u;
  return safe;
}

module.exports = { register, login, forgotPassword, resetPassword, me };
