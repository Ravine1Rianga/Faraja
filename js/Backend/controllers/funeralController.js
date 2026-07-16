const db = require('../config/db');
const R  = require('../utils/response');

async function createFuneral(req, res) {
  try {
    let {
      deceasedName, dateOfBirth, dateOfDeath, biography,
      funeralDate, funeralTime, venue, burialSite,
      officiant, mortuary, fundraisingGoal, privacy, notifyMsg,
      committee = [],
    } = req.body;

    // committee comes as JSON string from FormData
    if (typeof committee === 'string') {
      try { committee = JSON.parse(committee); } catch (_) { committee = []; }
    }

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
      `SELECT f.*,
        (SELECT COUNT(*) FROM contributions WHERE funeral_id = f.id AND status = 'confirmed') AS contributors_count
       FROM funeral_projects f WHERE f.created_by = ? ORDER BY f.created_at DESC`,
      [req.user.id]
    );
    return R.ok(res, { funerals });
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function getFuneral(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT f.*,
        (SELECT COUNT(*) FROM contributions WHERE funeral_id = f.id AND status = 'confirmed') AS contributors_count
       FROM funeral_projects f WHERE f.id = ?`,
      [req.params.id]
    );
    const funeral = rows[0];
    if (!funeral) return R.notFound(res, 'Memorial not found');

    // Private = hidden from public listings, but anyone with the direct link can donate

    const [committee] = await db.query(
      'SELECT * FROM committee_members WHERE funeral_id = ?', [funeral.id]
    );

    const days_remaining = funeral.funeral_date
      ? Math.max(0, Math.ceil((new Date(funeral.funeral_date) - new Date()) / 86400000))
      : null;

    return R.ok(res, { funeral: { ...funeral, days_remaining }, committee });
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
      privacy: 'privacy', notifyMsg: 'notify_msg',
      livestreamUrl: 'livestream_url', orderOfService: 'order_of_service',
      galleryPhotos: 'gallery_photos',
      status: 'status',
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

    const [upcomingTaskRows] = await db.query(
      `SELECT id, title, status, due_date
       FROM tasks WHERE funeral_id = ? AND status != 'completed'
       ORDER BY due_date ASC LIMIT 5`,
      [id]
    );

    const [recentContributions] = await db.query(
      `SELECT contributor_name AS donor_name, is_anonymous, amount, payment_method, created_at
       FROM contributions WHERE funeral_id = ? AND status = 'confirmed'
       ORDER BY created_at DESC LIMIT 5`,
      [id]
    );

    const activity = recentContributions.map(c => ({
      text: `${c.is_anonymous ? 'Anonymous' : c.donor_name} contributed KES ${Number(c.amount).toLocaleString()}`,
      description: `via ${c.payment_method}`,
      created_at: c.created_at,
    }));

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
        upcomingTasks:    upcomingTaskRows,
      },
      topContributors,
      recentActivity: activity,
    });
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function getActiveFunerals(req, res) {
  try {
    const [publicRows] = await db.query(
      `SELECT id, deceased_name, funeral_date, funeral_time, venue, photo, fundraising_goal, raised, privacy, created_by
       FROM funeral_projects WHERE status = 'active' AND privacy = 'public'
       ORDER BY created_at DESC`
    );
    let all = [...publicRows];
    if (req.user?.id) {
      const [privateRows] = await db.query(
        `SELECT id, deceased_name, funeral_date, funeral_time, venue, photo, fundraising_goal, raised, privacy, created_by
         FROM funeral_projects WHERE status = 'active' AND privacy = 'private' AND created_by = ?
         ORDER BY created_at DESC`,
        [req.user.id]
      );
      all = [...all, ...privateRows];
    }
    return R.ok(res, { funerals: all });
  } catch (err) {
    return R.serverError(res, err);
  }
}

// ── Public memorial (tribute page, no auth required) ────────
async function getPublicMemorial(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT f.id, f.created_by, f.deceased_name, f.date_of_birth, f.date_of_death,
              f.biography, f.photo, f.gallery_photos, f.order_of_service,
              f.funeral_date, f.funeral_time, f.venue, f.livestream_url,
              f.burial_site, f.officiant, f.mortuary,
              f.fundraising_goal, f.raised, f.privacy, f.notify_msg, f.tier,
              u.name AS organiser_name
       FROM funeral_projects f
       JOIN users u ON u.id = f.created_by
       WHERE f.id = ? AND f.status = 'active'`,
      [req.params.id]
    );
    if (!rows[0]) return R.notFound(res, 'Memorial not found');
    const m = rows[0];
    return R.ok(res, {
      memorial: {
        ...m,
        galleryPhotos: m.gallery_photos ? JSON.parse(m.gallery_photos) : [],
      },
    });
  } catch (err) {
    return R.serverError(res, err);
  }
}

// ── Print-friendly memorial data ─────────────────────────────
async function printMemorial(req, res) {
  try {
    const [rows] = await db.query(
      `SELECT f.*, u.name AS organiser_name, u.email AS organiser_email, u.phone AS organiser_phone
       FROM funeral_projects f
       JOIN users u ON u.id = f.created_by
       WHERE f.id = ?`,
      [req.params.id]
    );
    if (!rows[0]) return R.notFound(res, 'Memorial not found');
    const [contributions] = await db.query(
      `SELECT contributor_name, amount, message, created_at
       FROM contributions WHERE funeral_id = ? AND status = 'confirmed'
       ORDER BY created_at DESC`,
      [req.params.id]
    );
    return R.ok(res, { memorial: rows[0], contributions });
  } catch (err) {
    return R.serverError(res, err);
  }
}

// ── Upgrade memorial tier (admin only) ───────────────────────
async function upgradeTier(req, res) {
  try {
    const { tier } = req.body;
    const valid = ['free', 'premium', 'premium_plus'];
    if (!valid.includes(tier)) return R.fail(res, 'Invalid tier. Valid: free, premium, premium_plus');

    const [rows] = await db.query('SELECT * FROM funeral_projects WHERE id = ?', [req.params.id]);
    if (!rows[0]) return R.notFound(res, 'Memorial not found');

    const expiresAt = tier !== 'free'
      ? new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 19).replace('T', ' ')
      : null;

    await db.query('UPDATE funeral_projects SET tier = ?, premium_expires_at = ? WHERE id = ?',
      [tier, expiresAt, req.params.id]);

    const [updated] = await db.query('SELECT id, tier, premium_expires_at FROM funeral_projects WHERE id = ?', [req.params.id]);
    return R.ok(res, { memorial: updated[0] }, `Upgraded to ${tier}`);
  } catch (err) {
    return R.serverError(res, err);
  }
}

// ── Announce / notify diaspora (stub) ────────────────────────
async function announceFuneral(req, res) {
  try {
    const { channels = ['whatsapp'], message } = req.body;
    const [rows] = await db.query(
      'SELECT id, deceased_name, funeral_date, venue FROM funeral_projects WHERE id = ?',
      [req.params.id]
    );
    if (!rows[0]) return R.notFound(res, 'Memorial not found');

    const shareText = message ||
      `🕊 In loving memory of ${rows[0].deceased_name}.\nFuneral: ${rows[0].funeral_date || 'TBD'} at ${rows[0].venue || 'TBD'}.\nSupport the family: ${req.protocol}://${req.get('host')}/memorial.html?id=${rows[0].id}`;

    // Stub — no real WhatsApp/SMS gateway
    return R.ok(res, {
      shareText,
      channels,
      note: 'Platform announcement recorded. Real WhatsApp/SMS gateway not yet connected.',
    }, 'Announcement prepared');
  } catch (err) {
    return R.serverError(res, err);
  }
}

module.exports = {
  createFuneral, getMyFunerals, getFuneral, updateFuneral, deleteFuneral,
  getDashboard, getActiveFunerals, getPublicMemorial, printMemorial,
  upgradeTier, announceFuneral,
};
