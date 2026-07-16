const db = require('../config/db');
const R  = require('../utils/response');

async function getVendors(req, res) {
  try {
    const [vendors] = await db.query(
      `SELECT v.*, u.name AS user_name, u.email AS user_email
       FROM vendors v JOIN users u ON u.id = v.user_id
       ORDER BY v.created_at DESC`
    );
    return R.ok(res, { vendors });
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function getActiveVendors(req, res) {
  try {
    const [vendors] = await db.query(
      `SELECT v.id, v.business_name, v.category, v.location, v.phone, v.email,
              v.description, v.photo, v.rating, v.verified, v.views, v.created_at
       FROM vendors v
       WHERE v.status = 'active'
       ORDER BY v.rating DESC, v.created_at DESC`
    );
    return R.ok(res, { vendors });
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function getVendor(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT v.*, u.name AS user_name, u.email AS user_email
       FROM vendors v JOIN users u ON u.id = v.user_id
       WHERE v.id = ?`,
      [req.params.id]
    );
    if (!rows[0]) return R.notFound(res, 'Vendor not found');
    return R.ok(res, { vendor: rows[0] });
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function getMyVendorProfile(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT v.*, u.name AS user_name, u.email AS user_email
       FROM vendors v JOIN users u ON u.id = v.user_id
       WHERE v.user_id = ?`,
      [req.user.id]
    );
    if (!rows[0]) return R.notFound(res, 'Vendor profile not found. Register as vendor first.');
    return R.ok(res, { vendor: rows[0] });
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function createVendor(req, res) {
  try {
    const { businessName, category, location, phone, email, description } = req.body;
    if (!businessName) return R.fail(res, 'Business name is required');

    const photo = req.file ? `/uploads/${req.file.filename}` : null;

    const [existing] = await db.query('SELECT id FROM vendors WHERE user_id = ?', [req.user.id]);
    if (existing[0]) return R.fail(res, 'Vendor profile already exists for this user');

    const [result] = await db.query(
      `INSERT INTO vendors (user_id, business_name, category, location, phone, email, description, photo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, businessName, category || 'Other', location || null, phone || null, email || null, description || null, photo]
    );

    const [vendor] = await db.query('SELECT * FROM vendors WHERE id = ?', [result.insertId]);
    return R.created(res, { vendor: vendor[0] }, 'Vendor profile created');
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function updateVendor(req, res) {
  try {
    const { businessName, category, location, phone, email, description, status, verified, rating } = req.body;
    const vendorId = req.params.id;

    const [existing] = await db.query('SELECT id, user_id FROM vendors WHERE id = ?', [vendorId]);
    if (!existing[0]) return R.notFound(res, 'Vendor not found');
    const isOwner = existing[0].user_id === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return R.forbidden(res, 'Not authorized to update this vendor');
    }

    const updates = [];
    const values  = [];
    if (businessName !== undefined) { updates.push('business_name = ?'); values.push(businessName); }
    if (category !== undefined)     { updates.push('category = ?');      values.push(category); }
    if (location !== undefined)     { updates.push('location = ?');      values.push(location); }
    if (phone !== undefined)        { updates.push('phone = ?');         values.push(phone); }
    if (email !== undefined)        { updates.push('email = ?');         values.push(email); }
    if (description !== undefined)  { updates.push('description = ?');   values.push(description); }
    const photo = req.file ? `/uploads/${req.file.filename}` : undefined;
    if (photo !== undefined)        { updates.push('photo = ?');         values.push(photo); }
    if (status !== undefined)       { updates.push('status = ?');        values.push(status); }
    if (verified !== undefined)     { updates.push('verified = ?');      values.push(verified); }
    if (rating !== undefined)       { updates.push('rating = ?');        values.push(rating); }

    if (!updates.length) return R.fail(res, 'Nothing to update');

    values.push(vendorId);
    await db.query(`UPDATE vendors SET ${updates.join(', ')} WHERE id = ?`, values);

    const [vendor] = await db.query('SELECT * FROM vendors WHERE id = ?', [vendorId]);
    return R.ok(res, { vendor: vendor[0] }, 'Vendor updated');
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function deleteVendor(req, res) {
  try {
    const [existing] = await db.query('SELECT id, user_id FROM vendors WHERE id = ?', [req.params.id]);
    if (!existing[0]) return R.notFound(res, 'Vendor not found');
    const isOwner = existing[0].user_id === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      return R.forbidden(res, 'Not authorized to delete this vendor');
    }
    await db.query('DELETE FROM vendors WHERE id = ?', [req.params.id]);
    return R.ok(res, {}, 'Vendor deleted');
  } catch (err) {
    return R.serverError(res, err);
  }
}

// ── Admin: approve / reject / suspend vendor ────────────────
async function approveVendor(req, res) {
  try {
    const { status } = req.body;
    if (!['active', 'suspended', 'pending'].includes(status)) {
      return R.fail(res, 'Invalid status. Use: active, suspended, or pending');
    }
    const [existing] = await db.query('SELECT id, business_name FROM vendors WHERE id = ?', [req.params.id]);
    if (!existing[0]) return R.notFound(res, 'Vendor not found');
    await db.query('UPDATE vendors SET status = ?, verified = ? WHERE id = ?',
      [status, status === 'active' ? 1 : 0, req.params.id]);
    return R.ok(res, { vendorId: req.params.id, status, verified: status === 'active' }, `Vendor ${status}`);
  } catch (err) {
    return R.serverError(res, err);
  }
}

module.exports = { getVendors, getActiveVendors, getVendor, getMyVendorProfile, createVendor, updateVendor, deleteVendor, approveVendor };
