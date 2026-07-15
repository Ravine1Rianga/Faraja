const db = require('../config/db');
const R = require('../utils/response');

async function generateAnnouncement(req, res) {
  try {
    const funeralId = req.params.funeralId;
    const { customMessage } = req.body;

    const [fRows] = await db.query('SELECT * FROM funeral_projects WHERE id = ?', [funeralId]);
    if (!fRows[0]) return R.notFound(res, 'Memorial not found');
    const funeral = fRows[0];

    const [committee] = await db.query('SELECT * FROM committee_members WHERE funeral_id = ?', [funeralId]);

    const announcementData = {
      deceasedName: funeral.deceased_name,
      dateOfBirth: funeral.date_of_birth,
      dateOfDeath: funeral.date_of_death,
      funeralDate: funeral.funeral_date,
      funeralTime: funeral.funeral_time,
      venue: funeral.venue,
      burialSite: funeral.burial_site,
      officiant: funeral.officiant,
      mortuary: funeral.mortuary,
      photo: funeral.photo,
      customMessage: customMessage || null,
      committee: committee.map(c => ({ name: c.name, role: c.committee_role, phone: c.phone }))
    };

    return R.ok(res, { document: announcementData });
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function generateObituary(req, res) {
  try {
    const funeralId = req.params.funeralId;
    const { customMessage } = req.body;

    const [fRows] = await db.query('SELECT * FROM funeral_projects WHERE id = ?', [funeralId]);
    if (!fRows[0]) return R.notFound(res, 'Memorial not found');
    const funeral = fRows[0];

    const [committee] = await db.query('SELECT * FROM committee_members WHERE funeral_id = ?', [funeralId]);

    const obituaryData = {
      deceasedName: funeral.deceased_name,
      dateOfBirth: funeral.date_of_birth,
      dateOfDeath: funeral.date_of_death,
      biography: funeral.biography,
      funeralDate: funeral.funeral_date,
      funeralTime: funeral.funeral_time,
      venue: funeral.venue,
      burialSite: funeral.burial_site,
      officiant: funeral.officiant,
      mortuary: funeral.mortuary,
      photo: funeral.photo,
      customMessage: customMessage || null,
      committee: committee.map(c => ({ name: c.name, role: c.committee_role, phone: c.phone }))
    };

    return R.ok(res, { document: obituaryData });
  } catch (err) {
    return R.serverError(res, err);
  }
}

module.exports = { generateAnnouncement, generateObituary };
