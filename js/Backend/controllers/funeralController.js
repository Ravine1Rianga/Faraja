const db = require('../config/db');
const R  = require('../utils/response');

async function createFuneral(req, res) {
  try {
    const {
      deceasedName, dateOfBirth, dateOfDeath, biography,
      funeralDate, funeralTime, venue, burialSite,
      officiant, mortuary, fundraisingGoal, privacy, notifyMsg,
      committee = [],
    } = req.body;

    if (!deceasedName || !venue || !funeralDate) {
      return R.fail(res, 'Deceased name, venue and funeral date are required');
    }

    const photo = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await db.query(
      `INSERT INTO funeral_projects
        (created_by, deceased_name, date_of_birth, date_of_death, biography, photo,
         funeral_date, funeral_time, venue, burial_site, officiant, mortuary,
         fundraising_goal, privacy, notify_msg)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        req.user.id, deceasedName, dateOfBirth || null, dateOfDeath || null,
        biography || null, photo, funeralDate, funeralTime || null, venue,
        burialSite || null, officiant || null, mortuary || null,
        fundraisingGoal || 0, privacy || 'public', notifyMsg || null,
      ]
    );

    const funeralId = result.insertId;

    if (Array.isArray(committee) && committee.length) {
      for (const m of committee.filter(m => m.name)) {
        await db.query(
          'INSERT INTO committee_members (funeral_id, user_id, name, phone, committee_role) VALUES (?,?,?,?,?)',
          [funeralId, null, m.name, m.phone || null, m.role || null]
        );
      }
    }

    const [rows] = await db.query('SELECT * FROM funeral_projects WHERE id = ?', [funeralId]);
    return R.created(res, { funeral: rows[0] }, 'Memorial created');
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function getMyFunerals(req, res) {
  try {
    const [funerals] = await db.query(
      'SELECT * FROM funeral_projects WHERE created_by = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    return R.ok(res, { funerals });
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function getFuneral(req, res) {
  try {
    const [rows] = await db.query('SELECT * FROM funeral_projects WHERE id = ?', [req.params.id]);
    const funeral = rows[0];
    if (!funeral) return R.notFound(res, 'Memorial not found');

    if (funeral.privacy === 'private' && funeral.created_by !== req.user?.id) {
      return R.forbidden(res, 'This memorial is private');
    }

    const [committee] = await db.query(
      'SELECT * FROM committee_members WHERE funeral_id = ?', [funeral.id]
    );

    return R.ok(res, { funeral, committee });
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function updateFuneral(req, res) {
  try {
    const [rows] = await db.query('SELECT * FROM funeral_projects WHERE id = ?', [req.params.id]);
    if (!rows[0]) return R.notFound(res, 'Memorial not found');
    if (rows[0].created_by !== req.user.id) return R.forbidden(res);

    const map = {
      deceasedName: 'deceased_name', dateOfBirth: 'date_of_birth',
      dateOfDeath: 'date_of_death', biography: 'biography',
      funeralDate: 'funeral_date', funeralTime: 'funeral_time',
      venue: 'venue', burialSite: 'burial_site', officiant: 'officiant',
      mortuary: 'mortuary', fundraisingGoal: 'fundraising_goal',
      privacy: 'privacy', status: 'status',
    };

    const updates = [];
    const values  = [];

    Object.entries(map).forEach(([bodyKey, colName]) => {
      if (req.body[bodyKey] !== undefined) {
        updates.push(`${colName} = ?`);
        values.push(req.body[bodyKey]);
      }
    });
    if (req.file) { updates.push('photo = ?'); values.push(`/uploads/${req.file.filename}`); }
    if (!updates.length) return R.fail(res, 'Nothing to update');

    values.push(req.params.id);
    await db.query(`UPDATE funeral_projects SET ${updates.join(', ')} WHERE id = ?`, values);
    const [updated] = await db.query('SELECT * FROM funeral_projects WHERE id = ?', [req.params.id]);
    return R.ok(res, { funeral: updated[0] }, 'Memorial updated');
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function deleteFuneral(req, res) {
  try {
    const [rows] = await db.query('SELECT * FROM funeral_projects WHERE id = ?', [req.params.id]);
    if (!rows[0]) return R.notFound(res, 'Memorial not found');
    if (rows[0].created_by !== req.user.id) return R.forbidden(res);

    await db.query('DELETE FROM funeral_projects WHERE id = ?', [req.params.id]);
    return R.ok(res, {}, 'Memorial deleted');
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function getDashboard(req, res) {
  try {
    const { id } = req.params;
    const [fRows] = await db.query('SELECT * FROM funeral_projects WHERE id = ?', [id]);
    if (!fRows[0]) return R.notFound(res, 'Memorial not found');
    if (fRows[0].created_by !== req.user.id) return R.forbidden(res);
    const funeral = fRows[0];

    const [finance] = await db.query(
      `SELECT
         f.fundraising_goal AS goal,
         f.raised,
         COALESCE((SELECT SUM(amount) FROM expenses WHERE funeral_id = f.id), 0) AS "totalExpenses",
         (SELECT COUNT(DISTINCT COALESCE(CAST(user_id AS CHAR), contributor_name))
          FROM contributions WHERE funeral_id = f.id AND status = 'confirmed') AS "contributorsCount"
       FROM funeral_projects f WHERE f.id = ?`,
      [id]
    );

    const [taskStats] = await db.query(
      `SELECT COUNT(*) AS total,
              SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) AS done
       FROM tasks WHERE funeral_id = ?`,
      [id]
    );

    const [topContributors] = await db.query(
      `SELECT contributor_name AS donor_name, is_anonymous,
              SUM(amount) AS total_amount, COUNT(*) AS contribution_count, payment_method
       FROM contributions WHERE funeral_id = ? AND status = 'confirmed'
       GROUP BY contributor_name, is_anonymous, payment_method
       ORDER BY total_amount DESC LIMIT 5`,
      [id]
    );

    const [recentContributions] = await db.query(
      `SELECT contributor_name AS donor_name, is_anonymous, amount, payment_method, created_at
       FROM contributions WHERE funeral_id = ? AND status = 'confirmed'
       ORDER BY created_at DESC LIMIT 5`,
      [id]
    );

    const daysLeft = funeral.funeral_date
      ? Math.max(0, Math.ceil((new Date(funeral.funeral_date) - new Date()) / 86400000))
      : null;

    const fin = finance[0] || {};
    return R.ok(res, {
      funeral,
      stats: {
        daysLeft,
        raised:           fin.raised || 0,
        goal:             fin.goal || 0,
        totalExpenses:    fin.totalExpenses || 0,
        netBalance:       Number(fin.raised || 0) - Number(fin.totalExpenses || 0),
        contributorsCount: fin.contributorsCount || 0,
        tasksDone:        taskStats[0]?.done  || 0,
        tasksTotal:       taskStats[0]?.total || 0,
        progressPct: fin.goal > 0 ? Math.round((fin.raised / fin.goal) * 100) : 0,
      },
      topContributors,
      recentActivity: recentContributions,
    });
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function getActiveFunerals(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT id, deceased_name, funeral_date, fundraising_goal, raised
       FROM funeral_projects WHERE status = 'active' AND privacy = 'public'
       ORDER BY created_at DESC`
    );
    return R.ok(res, { funerals: rows });
  } catch (err) {
    return R.serverError(res, err);
  }
}

module.exports = { createFuneral, getMyFunerals, getFuneral, updateFuneral, deleteFuneral, getDashboard, getActiveFunerals };
