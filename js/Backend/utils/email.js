// ================================================================
//  FARAJA — Email utility (Nodemailer)
//  Supports Gmail OAuth2 or plain SMTP (dev: Mailtrap / Ethereal)
// ================================================================

const nodemailer = require('nodemailer');

// Build a transporter from .env settings.
// For local dev set EMAIL_HOST=smtp.mailtrap.io (or use Ethereal).
// For production set EMAIL_SERVICE=gmail with an App Password.
function createTransporter() {
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,   // Gmail App Password (not your real password)
      },
    });
  }

  // Default: generic SMTP (Mailtrap, Ethereal, etc.)
  return nodemailer.createTransport({
    host:   process.env.EMAIL_HOST   || 'smtp.mailtrap.io',
    port:   parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

// ── Branded base template ──────────────────────────────────────
function baseTemplate(title, bodyHtml) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#1a1a2e;font-family:Georgia,serif;">
  <div style="max-width:560px;margin:40px auto;background:#12122a;border-radius:12px;overflow:hidden;border:1px solid rgba(201,168,76,0.2);">
    <!-- Header -->
    <div style="background:linear-gradient(135deg,#12122a,#1e1e3f);padding:32px 40px;border-bottom:1px solid rgba(201,168,76,0.2);text-align:center;">
      <div style="font-size:2rem;margin-bottom:4px;">🕊</div>
      <div style="font-family:Georgia,serif;font-size:1.6rem;color:#fff;letter-spacing:0.05em;">
        Fa<span style="color:#c9a84c;">raja</span>
      </div>
      <div style="font-size:0.75rem;color:rgba(255,255,255,0.4);margin-top:4px;letter-spacing:0.1em;text-transform:uppercase;">
        Dignified Farewells
      </div>
    </div>
    <!-- Body -->
    <div style="padding:36px 40px;color:#e8e8e8;line-height:1.7;font-size:0.95rem;">
      ${bodyHtml}
    </div>
    <!-- Footer -->
    <div style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.07);text-align:center;font-size:0.75rem;color:rgba(255,255,255,0.3);">
      © ${new Date().getFullYear()} Faraja Platform · Nairobi, Kenya<br/>
      You received this because you have a Faraja account.
    </div>
  </div>
</body>
</html>`;
}

// ── Send helper ────────────────────────────────────────────────
async function sendMail({ to, subject, html, text }) {
  const transporter = createTransporter();
  const from = `"Faraja Platform 🕊" <${process.env.EMAIL_USER || 'noreply@faraja.co.ke'}>`;

  const info = await transporter.sendMail({ from, to, subject, html, text });
  console.log(`[EMAIL] Sent to ${to} — messageId: ${info.messageId}`);
  return info;
}

// ── Password reset email ───────────────────────────────────────
async function sendPasswordReset(email, resetUrl) {
  const html = baseTemplate('Reset Your Faraja Password', `
    <h2 style="color:#c9a84c;margin-top:0;">Reset Your Password</h2>
    <p>We received a request to reset the password for your Faraja account.</p>
    <p>Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.</p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${resetUrl}"
         style="display:inline-block;background:#c9a84c;color:#12122a;padding:14px 32px;border-radius:8px;font-weight:700;text-decoration:none;font-size:1rem;font-family:sans-serif;">
        Reset My Password
      </a>
    </div>
    <p style="font-size:0.82rem;color:rgba(255,255,255,0.45);">
      If you didn't request this, you can safely ignore this email — your password will not change.<br/>
      Or copy this link: <span style="color:#c9a84c;">${resetUrl}</span>
    </p>
  `);

  return sendMail({
    to: email,
    subject: '🔐 Reset your Faraja password',
    html,
    text: `Reset your Faraja password:\n${resetUrl}\n\nLink expires in 1 hour.`,
  });
}

// ── Welcome email ─────────────────────────────────────────────
async function sendWelcome(email, name) {
  const html = baseTemplate('Welcome to Faraja', `
    <h2 style="color:#c9a84c;margin-top:0;">Welcome, ${name.split(' ')[0]} 🕊</h2>
    <p>Thank you for joining Faraja. We're here to help your family plan with dignity and coordinate contributions transparently.</p>
    <p>Here's what you can do next:</p>
    <ul style="padding-left:20px;color:#c8c8c8;">
      <li style="margin-bottom:8px;">Create a memorial for your loved one</li>
      <li style="margin-bottom:8px;">Share the donation link with family and friends</li>
      <li style="margin-bottom:8px;">Assign committee members and tasks</li>
      <li style="margin-bottom:8px;">Track every shilling raised and spent</li>
    </ul>
    <div style="text-align:center;margin:32px 0;">
      <a href="${process.env.CLIENT_URL || 'http://localhost:5500'}/create-funeral.html"
         style="display:inline-block;background:#c9a84c;color:#12122a;padding:14px 32px;border-radius:8px;font-weight:700;text-decoration:none;font-size:1rem;font-family:sans-serif;">
        Create Your First Memorial →
      </a>
    </div>
  `);

  return sendMail({
    to: email,
    subject: '🕊 Welcome to Faraja — Let\'s get started',
    html,
    text: `Welcome to Faraja, ${name}! Create your first memorial at ${process.env.CLIENT_URL || 'http://localhost:5500'}/create-funeral.html`,
  });
}

// ── Contribution notification to organiser ────────────────────
async function sendContributionAlert(organizerEmail, { deceasedName, donorName, amount, paymentMethod }) {
  const html = baseTemplate('New Contribution Received', `
    <h2 style="color:#22c55e;margin-top:0;">💚 New Contribution!</h2>
    <p>A new harambee contribution has been received for the <strong>${deceasedName}</strong> memorial fund.</p>
    <div style="background:rgba(255,255,255,0.05);border-radius:8px;padding:20px;margin:24px 0;">
      <div style="margin-bottom:10px;"><span style="color:rgba(255,255,255,0.45);font-size:0.82rem;">Contributor</span><br/><strong>${donorName}</strong></div>
      <div style="margin-bottom:10px;"><span style="color:rgba(255,255,255,0.45);font-size:0.82rem;">Amount</span><br/><strong style="color:#22c55e;font-size:1.2rem;">KES ${Number(amount).toLocaleString('en-KE')}</strong></div>
      <div><span style="color:rgba(255,255,255,0.45);font-size:0.82rem;">Method</span><br/><strong>${paymentMethod?.toUpperCase()}</strong></div>
    </div>
    <p style="font-size:0.85rem;color:rgba(255,255,255,0.5);">Log in to your dashboard to see the full contribution history.</p>
  `);

  return sendMail({
    to: organizerEmail,
    subject: `💚 KES ${Number(amount).toLocaleString('en-KE')} received — ${deceasedName} fund`,
    html,
    text: `New contribution: KES ${amount} from ${donorName} via ${paymentMethod} for ${deceasedName}.`,
  });
}

module.exports = { sendPasswordReset, sendWelcome, sendContributionAlert };
