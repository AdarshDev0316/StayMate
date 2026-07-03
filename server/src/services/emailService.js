const nodemailer = require('nodemailer');

// ─── Transporter ──────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ─── Base Email Template ──────────────────────────────────────────────────────
const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>StayMate</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #F8F9FC; }
    .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(76,92,231,0.1); }
    .header { background: linear-gradient(135deg, #4C5CE7 0%, #08B094 100%); padding: 32px; text-align: center; }
    .header h1 { color: #fff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { color: rgba(255,255,255,0.85); font-size: 14px; margin-top: 4px; }
    .body { padding: 40px 32px; }
    .body h2 { color: #111827; font-size: 22px; font-weight: 600; margin-bottom: 16px; }
    .body p { color: #64748B; font-size: 15px; line-height: 1.7; margin-bottom: 12px; }
    .cta { display: inline-block; margin: 24px 0; padding: 14px 32px; background: linear-gradient(135deg, #4C5CE7, #08B094); color: #fff; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px; }
    .highlight { background: #F8F9FC; border-left: 4px solid #4C5CE7; padding: 16px; border-radius: 0 8px 8px 0; margin: 16px 0; }
    .score-badge { display: inline-flex; align-items: center; gap: 8px; background: #DCFCE7; color: #16A34A; padding: 8px 16px; border-radius: 999px; font-weight: 700; font-size: 18px; margin: 8px 0; }
    .footer { background: #F8F9FC; padding: 24px 32px; text-align: center; border-top: 1px solid #E2E8F0; }
    .footer p { color: #94A3B8; font-size: 12px; line-height: 1.6; }
    .footer a { color: #4C5CE7; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🏠 StayMate</h1>
      <p>Rent & Flatmate Finder</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} StayMate. All rights reserved.<br/>
      You are receiving this email because you have an account on <a href="${process.env.CLIENT_URL}">StayMate</a>.<br/>
      <a href="${process.env.CLIENT_URL}/unsubscribe">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>
`;

// ─── Send Email ───────────────────────────────────────────────────────────────
const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'StayMate <noreply@staymate.in>',
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent: ${info.messageId} → ${to}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error('❌ Email send error:', err.message);
    return { success: false, error: err.message };
  }
};

// ─── Email Templates ──────────────────────────────────────────────────────────

// 1. Email Verification
const sendVerificationEmail = async (user, token) => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  return sendEmail({
    to: user.email,
    subject: 'Verify your StayMate account',
    html: baseTemplate(`
      <h2>Welcome to StayMate, ${user.name}! 👋</h2>
      <p>You're almost there. Please verify your email address to activate your account and start finding your perfect room.</p>
      <div style="text-align:center;">
        <a href="${verifyUrl}" class="cta">Verify Email Address</a>
      </div>
      <p style="font-size:13px;color:#94A3B8;">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
    `),
  });
};

// 2. Welcome Email
const sendWelcomeEmail = async (user) => {
  const dashboardUrl = `${process.env.CLIENT_URL}/${user.role}/dashboard`;
  return sendEmail({
    to: user.email,
    subject: `Welcome to StayMate, ${user.name}!`,
    html: baseTemplate(`
      <h2>Your account is ready! 🎉</h2>
      <p>Hi ${user.name}, your StayMate account has been verified. You're now ready to ${user.role === 'owner' ? 'list your property and find the perfect tenant' : 'find your perfect room or flatmate'}.</p>
      <div style="text-align:center;">
        <a href="${dashboardUrl}" class="cta">Go to Dashboard</a>
      </div>
    `),
  });
};

// 3. Interest Received (Owner) — only for high-match interests
const sendInterestReceivedEmail = async (owner, tenant, listing, interest) => {
  const interestUrl = `${process.env.CLIENT_URL}/owner/interests`;
  const scoreColor = interest.aiScore >= 80 ? '#16A34A' : interest.aiScore >= 60 ? '#D97706' : '#DC2626';
  return sendEmail({
    to: owner.email,
    subject: `New Interest — ${tenant.name} is interested in "${listing.title}"`,
    html: baseTemplate(`
      <h2>You have a new interest request! 🏠</h2>
      <p><strong>${tenant.name}</strong> has expressed interest in your listing:</p>
      <div class="highlight">
        <strong>${listing.title}</strong><br/>
        <span style="color:#64748B;">${listing.location.city}</span> · ₹${listing.rent.toLocaleString()}/month
      </div>
      <p><strong>AI Compatibility Score:</strong></p>
      <div class="score-badge" style="background:${interest.aiScore >= 80 ? '#DCFCE7' : '#FEF9C3'};color:${scoreColor};">
        ${interest.aiScore !== null ? `${interest.aiScore}/100 Match` : 'Calculating...'}
      </div>
      ${interest.aiExplanation ? `<p style="color:#64748B;font-style:italic;">"${interest.aiExplanation}"</p>` : ''}
      <div style="text-align:center;margin-top:24px;">
        <a href="${interestUrl}" class="cta">View & Respond</a>
      </div>
    `),
  });
};

// 4. Interest Accepted (Tenant)
const sendInterestAcceptedEmail = async (tenant, owner, listing) => {
  const chatUrl = `${process.env.CLIENT_URL}/tenant/chat`;
  return sendEmail({
    to: tenant.email,
    subject: `Great news! ${owner.name} accepted your interest 🎉`,
    html: baseTemplate(`
      <h2>Your interest was accepted! 🎉</h2>
      <p>Congratulations! <strong>${owner.name}</strong> has accepted your interest in:</p>
      <div class="highlight">
        <strong>${listing.title}</strong><br/>
        <span style="color:#64748B;">${listing.location.city}</span> · ₹${listing.rent.toLocaleString()}/month
      </div>
      <p>You can now chat with the owner to discuss move-in details, visit scheduling, and finalize the agreement.</p>
      <div style="text-align:center;">
        <a href="${chatUrl}" class="cta">Start Chatting</a>
      </div>
    `),
  });
};

// 5. Interest Declined (Tenant)
const sendInterestDeclinedEmail = async (tenant, listing) => {
  const browseUrl = `${process.env.CLIENT_URL}/browse`;
  return sendEmail({
    to: tenant.email,
    subject: `Update on your interest in "${listing.title}"`,
    html: baseTemplate(`
      <h2>Your interest status update</h2>
      <p>Unfortunately, the owner has declined your interest in:</p>
      <div class="highlight">
        <strong>${listing.title}</strong><br/>
        <span style="color:#64748B;">${listing.location.city}</span>
      </div>
      <p>Don't worry — there are many more great rooms on StayMate. Our AI will find you the best matches!</p>
      <div style="text-align:center;">
        <a href="${browseUrl}" class="cta">Browse More Rooms</a>
      </div>
    `),
  });
};

// 6. Password Reset
const sendPasswordResetEmail = async (user, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  return sendEmail({
    to: user.email,
    subject: 'Reset your StayMate password',
    html: baseTemplate(`
      <h2>Password Reset Request</h2>
      <p>Hi ${user.name}, we received a request to reset your password. Click the button below to set a new password.</p>
      <div style="text-align:center;">
        <a href="${resetUrl}" class="cta">Reset Password</a>
      </div>
      <p style="font-size:13px;color:#94A3B8;">This link expires in 1 hour. If you didn't request a password reset, please ignore this email.</p>
    `),
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
  sendInterestReceivedEmail,
  sendInterestAcceptedEmail,
  sendInterestDeclinedEmail,
  sendPasswordResetEmail,
};
