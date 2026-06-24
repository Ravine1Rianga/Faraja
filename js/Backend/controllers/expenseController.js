const db = require('../config/db');
const R  = require('../utils/response');

async function isOwner(funeralId, userId) {
  const [rows] = await db.query(
    'SELECT created_by FROM funeral_projects WHERE id = ?', [funeralId]
  );
  return rows[0] && rows[0].created_by === userId;
}

async function getExpenses(req, res) {
  try {
    const { funeralId } = req.params;
    const [expenses] = await db.query(
      'SELECT * FROM expenses WHERE funeral_id = ? ORDER BY expense_date DESC, created_at DESC',
      [funeralId]
    );
    const [totals] = await db.query(
      `SELECT
         COALESCE(SUM(amount),0) AS total,
         COALESCE(SUM(CASE WHEN status='paid'    THEN amount ELSE 0 END),0) AS paid,
         COALESCE(SUM(CASE WHEN status='pending' THEN amount ELSE 0 END),0) AS pending
       FROM expenses WHERE funeral_id = ?`,
      [funeralId]
    );
    return R.ok(res, {
      expenses,
      total:   totals[0]?.total   || 0,
      paid:    totals[0]?.paid    || 0,
      pending: totals[0]?.pending || 0,
    });
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function createExpense(req, res) {
  try {
    const { funeralId } = req.params;
    if (!await isOwner(funeralId, req.user.id)) return R.forbidden(res);

    const { description, category, amount, paidBy, expenseDate, status = 'pending', notes } = req.body;
    if (!description || !amount) return R.fail(res, 'Description and amount are required');

    const [result] = await db.query(
      `INSERT INTO expenses
         (funeral_id, recorded_by, paid_by, description, category, amount, status, notes, expense_date)
       VALUES (?,?,?,?,?,?,?,?,?)`,
      [funeralId, req.user.id, paidBy || null, description, category || null, amount, status, notes || null, expenseDate || null]
    );
    const [rows] = await db.query('SELECT * FROM expenses WHERE id = ?', [result.insertId]);
    return R.created(res, { expense: rows[0] }, 'Expense added');
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function updateExpense(req, res) {
  try {
    const [expRows] = await db.query('SELECT * FROM expenses WHERE id = ?', [req.params.expenseId]);
    if (!expRows[0]) return R.notFound(res, 'Expense not found');
    if (!await isOwner(expRows[0].funeral_id, req.user.id)) return R.forbidden(res);

    const map = {
      description: 'description', category: 'category', amount: 'amount',
      paidBy: 'paid_by', expenseDate: 'expense_date', status: 'status', notes: 'notes',
    };
    const updates = [];
    const values  = [];
    Object.entries(map).forEach(([bodyKey, col]) => {
      if (req.body[bodyKey] !== undefined) {
        updates.push(`${col} = ?`);
        values.push(req.body[bodyKey] ?? null);
      }
    });
    if (!updates.length) return R.fail(res, 'Nothing to update');

    values.push(req.params.expenseId);
    await db.query(`UPDATE expenses SET ${updates.join(', ')} WHERE id = ?`, values);
    const [updated] = await db.query('SELECT * FROM expenses WHERE id = ?', [req.params.expenseId]);
    return R.ok(res, { expense: updated[0] }, 'Expense updated');
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function deleteExpense(req, res) {
  try {
    const [expRows] = await db.query('SELECT * FROM expenses WHERE id = ?', [req.params.expenseId]);
    if (!expRows[0]) return R.notFound(res, 'Expense not found');
    if (!await isOwner(expRows[0].funeral_id, req.user.id)) return R.forbidden(res);

    await db.query('DELETE FROM expenses WHERE id = ?', [req.params.expenseId]);
    return R.ok(res, {}, 'Expense deleted');
  } catch (err) {
    return R.serverError(res, err);
  }
}

module.exports = { getExpenses, createExpense, updateExpense, deleteExpense };
