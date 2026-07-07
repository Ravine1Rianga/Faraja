const db = require('../config/db');
const R  = require('../utils/response');

async function createCondolence(req, res) {
  try {
    const { funeralId, name, email, message, relationship } = req.body;
    if (!funeralId || !message) {
      return R.fail(res, 'Funeral ID and message are required');
    }
    const [rows] = await db.query('SELECT id FROM funeral_projects WHERE id = ?', [funeralId]);
    if (!rows[0]) return R.notFound(res, 'Memorial not found');

    const [result] = await db.query(
      'INSERT INTO condolences (funeral_id, name, email, message, relationship) VALUES (?,?,?,?,?)',
      [funeralId, name || 'Anonymous', email || null, message, relationship || null]
    );
    const [[row]] = await db.query('SELECT * FROM condolences WHERE id = ?', [result.insertId]);
    return R.created(res, { condolence: row });
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function getCondolences(req, res) {
  try {
    const [list] = await db.query(
      `SELECT id, funeral_id, name, message, relationship, created_at
       FROM condolences WHERE funeral_id = ? AND is_approved = 1
       ORDER BY created_at DESC`,
      [req.params.funeralId]
    );
    const [[countResult]] = await db.query(
      'SELECT COUNT(*) AS count FROM condolences WHERE funeral_id = ? AND is_approved = 1',
      [req.params.funeralId]
    );
    return R.ok(res, { condolences: list, count: countResult.count || 0 });
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function deleteCondolence(req, res) {
  try {
    const [row] = await db.query('SELECT * FROM condolences WHERE id = ?', [req.params.id]);
    if (!row[0]) return R.notFound(res, 'Condolence not found');
    await db.query('DELETE FROM condolences WHERE id = ?', [req.params.id]);
    return R.ok(res, {}, 'Condolence deleted');
  } catch (err) {
    return R.serverError(res, err);
  }
}

module.exports = { createCondolence, getCondolences, deleteCondolence };
