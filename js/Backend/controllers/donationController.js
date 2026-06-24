const db    = require('../config/db');
const R     = require('../utils/response');
const mpesa = require('../utils/mpesa');

async function createDonation(req, res) {
  try {
    const {
      funeralId, amount, phone,
      donorName, paymentMethod = 'mpesa',
      message, isAnonymous = false,
    } = req.body;

    if (!funeralId || !amount) return R.fail(res, 'Funeral ID and amount are required');
    if (amount < 1) return R.fail(res, 'Amount must be at least KES 1');

    const name = isAnonymous ? 'Anonymous' : (donorName || req.user?.name || 'Guest');

    // M-PESA with STK push — pending until callback confirms
    if (paymentMethod === 'mpesa' && phone) {
      let stkResult = null;
      try {
        stkResult = await mpesa.stkPush({ phone, amount, funeralId });
      } catch (mpesaErr) {
        console.warn('[M-PESA] STK push failed:', mpesaErr.message);
      }

      if (stkResult) {
        const [cResult] = await db.query(
          `INSERT INTO contributions
             (funeral_id, user_id, contributor_name, amount, payment_method, message, is_anonymous, status)
           VALUES (?,?,?,?,?,?,?,'pending')`,
          [funeralId, req.user?.id || null, name, amount, paymentMethod, message || null, isAnonymous]
        );
        const contributionId = cResult.insertId;
        await db.query(
          'INSERT INTO transactions (contribution_id, phone, amount, checkout_req_id, status) VALUES (?,?,?,?,?)',
          [contributionId, phone, amount, stkResult.CheckoutRequestID || null, 'pending']
        );
        return R.created(res, {
          contributionId,
          checkoutRequestID: stkResult.CheckoutRequestID,
          message: stkResult.CustomerMessage || 'STK push sent. Enter your M-PESA PIN.',
        }, 'STK push initiated');
      }
    }

    // Cash / Card / Bank / failed M-PESA — auto-confirm
    const [cResult] = await db.query(
      `INSERT INTO contributions
         (funeral_id, user_id, contributor_name, amount, payment_method, message, is_anonymous, status)
       VALUES (?,?,?,?,?,?,?,'confirmed')`,
      [funeralId, req.user?.id || null, name, amount, paymentMethod, message || null, isAnonymous]
    );
    const contributionId = cResult.insertId;

    await db.query(
      'INSERT INTO transactions (contribution_id, phone, amount, status) VALUES (?,?,?,?)',
      [contributionId, phone || null, amount, 'confirmed']
    );

    await db.query(
      'UPDATE funeral_projects SET raised = raised + ? WHERE id = ?',
      [amount, funeralId]
    );

    return R.created(res, { contributionId }, 'Contribution recorded');
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function mpesaCallback(req, res) {
  try {
    const body = req.body?.Body?.stkCallback;
    if (!body) return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });

    const { CheckoutRequestID, ResultCode, CallbackMetadata } = body;
    const status = ResultCode === 0 ? 'confirmed' : 'failed';

    let mpesaCode = null;
    if (CallbackMetadata?.Item) {
      const codeItem = CallbackMetadata.Item.find(i => i.Name === 'MpesaReceiptNumber');
      mpesaCode = codeItem?.Value || null;
    }

    const [txnRows] = await db.query(
      'SELECT * FROM transactions WHERE checkout_req_id = ?', [CheckoutRequestID]
    );
    const txn = txnRows[0];
    if (txn) {
      await db.query(
        'UPDATE transactions SET status = ?, mpesa_code = ?, raw_callback = ? WHERE id = ?',
        [status, mpesaCode, JSON.stringify(req.body), txn.id]
      );
      await db.query('UPDATE contributions SET status = ? WHERE id = ?', [status, txn.contribution_id]);

      if (status === 'confirmed') {
        await db.query(
          'UPDATE funeral_projects SET raised = raised + ? WHERE id = (SELECT funeral_id FROM contributions WHERE id = ?)',
          [txn.amount, txn.contribution_id]
        );
      }
    }
    return res.json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (err) {
    console.error('[M-PESA callback]', err);
    return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
}

async function getDonations(req, res) {
  try {
    const [contributions] = await db.query(
      `SELECT c.*, t.mpesa_code, t.checkout_req_id
       FROM contributions c
       LEFT JOIN transactions t ON t.contribution_id = c.id
       WHERE c.funeral_id = ? AND c.status = 'confirmed'
       ORDER BY c.created_at DESC`,
      [req.params.funeralId]
    );
    const [totals] = await db.query(
      "SELECT COALESCE(SUM(amount),0) AS total, COUNT(*) AS count FROM contributions WHERE funeral_id = ? AND status = 'confirmed'",
      [req.params.funeralId]
    );
    return R.ok(res, { contributions, total: totals[0]?.total || 0, count: totals[0]?.count || 0 });
  } catch (err) {
    return R.serverError(res, err);
  }
}

async function financialReport(req, res) {
  try {
    const { funeralId } = req.params;
    const [summary] = await db.query(
      `SELECT f.fundraising_goal AS goal, f.raised,
         (SELECT COALESCE(SUM(amount),0) FROM expenses WHERE funeral_id = f.id) AS expenses
       FROM funeral_projects f WHERE f.id = ?`,
      [funeralId]
    );
    const [byMethod] = await db.query(
      "SELECT payment_method, SUM(amount) AS total, COUNT(*) AS count FROM contributions WHERE funeral_id = ? AND status='confirmed' GROUP BY payment_method",
      [funeralId]
    );
    const [expenseList] = await db.query(
      'SELECT * FROM expenses WHERE funeral_id = ? ORDER BY expense_date DESC', [funeralId]
    );
    return R.ok(res, { summary: summary[0], byMethod, expenses: expenseList });
  } catch (err) {
    return R.serverError(res, err);
  }
}

module.exports = { createDonation, mpesaCallback, getDonations, financialReport };
