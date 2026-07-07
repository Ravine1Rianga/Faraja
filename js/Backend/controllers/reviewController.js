const db = require('../config/db');
const R  = require('../utils/response');

async function createReview(req, res) {
  try {
    const { vendorId, rating, comment } = req.body;
    if (!vendorId || !rating || rating < 1 || rating > 5) {
      return R.fail(res, 'Vendor ID and rating (1-5) are required');
    }
    const [vendor] = await db.query('SELECT id FROM vendors WHERE id = ?', [vendorId]);
    if (!vendor[0]) return R.notFound(res, 'Vendor not found');

    const [existing] = await db.query('SELECT id FROM reviews WHERE vendor_id = ? AND user_id = ?', [vendorId, req.user.id]);
    if (existing[0]) return R.fail(res, 'You have already reviewed this vendor');

    const [result] = await db.query(
      'INSERT INTO reviews (vendor_id, user_id, rating, comment) VALUES (?,?,?,?)',
      [vendorId, req.user.id, rating, comment || null]
    );
    const [[row]] = await db.query('SELECT * FROM reviews WHERE id = ?', [result.insertId]);
    return R.created(res, { review: row });
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function getVendorReviews(req, res) {
  try {
    const [reviews] = await db.query(
      `SELECT r.*, u.name AS user_name
       FROM reviews r
       JOIN users u ON u.id = r.user_id
       WHERE r.vendor_id = ?
       ORDER BY r.created_at DESC`,
      [req.params.vendorId]
    );
    const [[stats]] = await db.query(
      'SELECT COUNT(*) AS count, ROUND(AVG(rating),1) AS avg_rating FROM reviews WHERE vendor_id = ?',
      [req.params.vendorId]
    );
    return R.ok(res, { reviews, stats: { count: stats.count || 0, avgRating: stats.avg_rating || 0 } });
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function deleteReview(req, res) {
  try {
    const [row] = await db.query('SELECT * FROM reviews WHERE id = ?', [req.params.id]);
    if (!row[0]) return R.notFound(res, 'Review not found');
    if (row[0].user_id !== req.user.id) return R.forbidden(res);
    await db.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    return R.ok(res, {}, 'Review deleted');
  } catch (err) {
    return R.serverError(res, err);
  }
}

module.exports = { createReview, getVendorReviews, deleteReview };
