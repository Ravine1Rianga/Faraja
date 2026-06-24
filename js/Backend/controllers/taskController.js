const db = require('../config/db');
const R  = require('../utils/response');

async function getTasks(req, res) {
  try {
    const [tasks] = await db.query(
      `SELECT t.*, cm.name AS assignee_name
       FROM tasks t
       LEFT JOIN committee_members cm ON cm.id = t.assigned_to
       WHERE t.funeral_id = ?
       ORDER BY
         CASE t.priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END,
         t.due_date ASC`,
      [req.params.funeralId]
    );
    return R.ok(res, { tasks });
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function createTask(req, res) {
  try {
    const { funeralId } = req.params;
    const { title, description, assignedTo, priority = 'medium', status = 'todo', dueDate } = req.body;
    if (!title) return R.fail(res, 'Task title is required');

    const [result] = await db.query(
      'INSERT INTO tasks (funeral_id, assigned_to, title, description, priority, status, due_date) VALUES (?,?,?,?,?,?,?)',
      [funeralId, assignedTo || null, title, description || null, priority, status, dueDate || null]
    );
    const [rows] = await db.query('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
    return R.created(res, { task: rows[0] }, 'Task created');
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function updateTask(req, res) {
  try {
    const map = {
      title: 'title', description: 'description', assignedTo: 'assigned_to',
      priority: 'priority', status: 'status', dueDate: 'due_date',
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

    values.push(req.params.taskId);
    await db.query(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`, values);
    const [rows] = await db.query('SELECT * FROM tasks WHERE id = ?', [req.params.taskId]);
    return R.ok(res, { task: rows[0] }, 'Task updated');
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function completeTask(req, res) {
  try {
    await db.query("UPDATE tasks SET status = 'completed' WHERE id = ?", [req.params.taskId]);
    return R.ok(res, {}, 'Task marked as complete');
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function deleteTask(req, res) {
  try {
    await db.query('DELETE FROM tasks WHERE id = ?', [req.params.taskId]);
    return R.ok(res, {}, 'Task deleted');
  } catch (err) {
    return R.serverError(res, err);
  }
}

module.exports = { getTasks, createTask, updateTask, completeTask, deleteTask };
