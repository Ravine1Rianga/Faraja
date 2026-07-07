const db = require('../config/db');
const R  = require('../utils/response');

async function createBooking(req, res) {
  try {
    const { funeralId, vendorId, productId, serviceDate, amount, notes } = req.body;
    if (!funeralId || !vendorId || !amount) return R.fail(res, 'Funeral ID, vendor ID and amount are required');

    const [funeral] = await db.query('SELECT id FROM funeral_projects WHERE id = ?', [funeralId]);
    if (!funeral[0]) return R.notFound(res, 'Funeral not found');

    const [vendor] = await db.query('SELECT id FROM vendors WHERE id = ?', [vendorId]);
    if (!vendor[0]) return R.notFound(res, 'Vendor not found');

    const [result] = await db.query(
      `INSERT INTO bookings (funeral_id, vendor_id, product_id, requested_by, service_date, amount, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [funeralId, vendorId, productId || null, req.user.id, serviceDate || null, amount, notes || null]
    );

    const [booking] = await db.query('SELECT * FROM bookings WHERE id = ?', [result.insertId]);
    return R.created(res, { booking: booking[0] }, 'Booking request sent');
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function getFuneralBookings(req, res) {
  try {
    const [bookings] = await db.query(
      `SELECT b.*, v.business_name AS vendor_name, v.category AS vendor_category,
              p.name AS product_name, u.name AS requester_name
       FROM bookings b
       JOIN vendors v ON v.id = b.vendor_id
       LEFT JOIN products p ON p.id = b.product_id
       JOIN users u ON u.id = b.requested_by
       WHERE b.funeral_id = ?
       ORDER BY b.created_at DESC`,
      [req.params.funeralId]
    );
    return R.ok(res, { bookings });
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function getVendorBookings(req, res) {
  try {
    const [vendor] = await db.query('SELECT id FROM vendors WHERE user_id = ?', [req.user.id]);
    if (!vendor[0]) return R.notFound(res, 'Vendor profile not found');

    const [bookings] = await db.query(
      `SELECT b.*, f.deceased_name, f.funeral_date, f.venue,
              p.name AS product_name, u.name AS requester_name
       FROM bookings b
       JOIN funeral_projects f ON f.id = b.funeral_id
       LEFT JOIN products p ON p.id = b.product_id
       JOIN users u ON u.id = b.requested_by
       WHERE b.vendor_id = ?
       ORDER BY b.created_at DESC`,
      [vendor[0].id]
    );
    return R.ok(res, { bookings });
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function getAllBookings(req, res) {
  try {
    const [bookings] = await db.query(
      `SELECT b.*, v.business_name AS vendor_name, f.deceased_name,
              p.name AS product_name, u.name AS requester_name
       FROM bookings b
       JOIN vendors v ON v.id = b.vendor_id
       JOIN funeral_projects f ON f.id = b.funeral_id
       LEFT JOIN products p ON p.id = b.product_id
       JOIN users u ON u.id = b.requested_by
       ORDER BY b.created_at DESC`
    );
    const [summary] = await db.query(
      `SELECT COUNT(*) AS total, SUM(amount) AS gmv, SUM(commission_amount) AS total_commission
       FROM bookings WHERE status = 'completed'`
    );
    return R.ok(res, { bookings, summary: summary[0] });
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function updateBookingStatus(req, res) {
  try {
    const { status } = req.body;
    const valid = ['requested', 'confirmed', 'completed', 'cancelled'];
    if (!valid.includes(status)) return R.fail(res, 'Invalid status');

    const [existing] = await db.query(
      `SELECT b.*, v.user_id AS vendor_user_id FROM bookings b
       JOIN vendors v ON v.id = b.vendor_id WHERE b.id = ?`,
      [req.params.id]
    );
    if (!existing[0]) return R.notFound(res, 'Booking not found');

    const isVendorOwner = existing[0].vendor_user_id === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isVendorOwner && !isAdmin) return R.forbidden(res, 'Not authorized');

    await db.query('UPDATE bookings SET status = ? WHERE id = ?', [status, req.params.id]);
    const [booking] = await db.query('SELECT * FROM bookings WHERE id = ?', [req.params.id]);
    return R.ok(res, { booking: booking[0] }, 'Booking ' + status);
  } catch (err) {
    return R.serverError(res, err);
  }
}

module.exports = { createBooking, getFuneralBookings, getVendorBookings, getAllBookings, updateBookingStatus };
