const nodemailer = require('nodemailer');
require('dotenv').config();

// Cached transporter instance
let transporter = null;
let isEthereal = false;

/**
 * Initializes and returns a Nodemailer transporter.
 * Supports standard SMTP config via .env, with automatic Ethereal test account fallback for dev.
 */
async function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    // Custom configured SMTP server
    transporter = nodemailer.createTransport({
      host: host,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
      auth: {
        user: user,
        pass: pass
      },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production'
      }
    });
    isEthereal = false;
    console.log(`[Email Service] Initialized SMTP transporter for host: ${host}`);
  } else {
    // Development fallback: Use Ethereal test account for instant testing with viewable emails
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      isEthereal = true;
      console.log(`📧 [Email Service] Initialized Ethereal test mailer (User: ${testAccount.user})`);
      console.log(`ℹ️ [Email Service] Real-time preview URLs will be logged for every email sent.`);
    } catch (err) {
      console.warn('⚠️ [Email Service] Could not initialize Ethereal test account (offline/network issue). Using JSON console transporter.');
      transporter = nodemailer.createTransport({
        jsonTransport: true
      });
      isEthereal = false;
    }
  }

  return transporter;
}

/**
 * Generates an HTML email template for password creation.
 */
function buildPasswordSetupHtml({ name, inviteLink, expiresDays = 7 }) {
  const currentYear = new Date().getFullYear();
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Set Your Password - PiezoPulse IoT Platform</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #0b1120;
      color: #e2e8f0;
    }
    .wrapper {
      width: 100%;
      table-layout: fixed;
      background-color: #0b1120;
      padding-top: 0px;
      padding-bottom: 0px;
      border-radius: 16px;
    }
    .main {
      background-color: #0f172a;
      margin: 0 auto;
      width: 100%;
      max-width: 600px;
      border-radius: 16px;
      border: 1px solid #1e293b;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #1e3a8a 0%, #0369a1 100%);
      padding: 20px 30px;
      margin: 20px 20px;
      border-radius: 12px;
      text-align: center;
    }
    .header h1 {
      color: #ffffff;
      margin: 0;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .header p {
      color: #bae6fd;
      margin: 6px 0 0 0;
      font-size: 13px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .content {
      padding: 10px 32px;
      color: #cbd5e1;
      font-size: 15px;
      line-height: 1.6;
    }
    .greeting {
      font-size: 18px;
      font-weight: 700;
      color: #f8fafc;
      margin-bottom: 16px;
    }
    .cta-box {
      margin: 32px 0;
      text-align: center;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #2563eb 0%, #0284c7 100%);
      color: #ffffff !important;
      font-size: 15px;
      font-weight: 600;
      text-decoration: none;
      padding: 14px 34px;
      border-radius: 10px;
      box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.4);
    }
    .info-box {
      background-color: #1e293b;
      border-left: 4px solid #38bdf8;
      border-radius: 8px;
      padding: 14px 18px;
      margin: 24px 0;
      font-size: 13px;
      color: #94a3b8;
    }
    .link-fallback {
      font-size: 12px;
      color: #64748b;
      word-break: break-all;
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid #1e293b;
    }
    .link-fallback a {
      color: #38bdf8;
      text-decoration: underline;
    }
    .footer {
      background-color: #090d16;
      padding: 24px 30px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid #1e293b;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="main">
      <div class="header">
        <h1>PiezoPulse IoT Platform</h1>
      </div>
      <div class="content">
        <div class="greeting">Hello ${name || 'Valued Customer'},</div>
        <p>
          Welcome to the <strong>PiezoPulse IoT Platform</strong>! To access your device management portal, please set your password by clicking the button below:
        </p>
        
        <div class="cta-box">
          <a href="${inviteLink}" class="btn" target="_blank">Set Your Account Password</a>
        </div>

        <div class="info-box">
          ⏰ <strong>Security Notice:</strong> For your security, this password setup link will expire in <strong>${expiresDays} days</strong>. Once activated, you can sign in directly using your email.
        </div>

        <div class="link-fallback">
          If the button above does not work, copy and paste this link into your browser:<br>
          <a href="${inviteLink}" target="_blank">${inviteLink}</a>
        </div>
      </div>
      <div class="footer">
        © ${currentYear} PiezoPulse IoT Platform. All rights reserved.<br>
        If you did not expect this invitation, please ignore this email or contact support.
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Sends a password setup invitation email to a customer.
 *
 * @param {Object} options
 * @param {string} options.to - Customer email
 * @param {string} options.name - Customer name
 * @param {string} options.inviteLink - Direct set-password link with token
 * @returns {Promise<{ success: boolean, messageId?: string, previewUrl?: string, error?: string }>}
 */
async function sendSetPasswordEmail({ to, name, inviteLink }) {
  try {
    const mailer = await getTransporter();
    const fromAddress = process.env.SMTP_FROM || '"PiezoPulse IoT Platform" <no-reply@piezopulse.io>';

    const htmlContent = buildPasswordSetupHtml({ name, inviteLink });
//     const textContent = `
// Hello ${name || 'Valued Customer'},

// Welcome to the PiezoPulse IoT Platform! An administrator has created an account for you.

// Please set your account password using the link below:
// ${inviteLink}

// This invitation link will expire in 7 days.

// © ${new Date().getFullYear()} PiezoPulse IoT Platform
//     `.trim();

    const info = await mailer.sendMail({
      from: fromAddress,
      to: to,
      subject: 'Set Account Password',
      // text: textContent,
      html: htmlContent
    });

    let previewUrl = null;
    if (isEthereal && nodemailer.getTestMessageUrl) {
      previewUrl = nodemailer.getTestMessageUrl(info);
      console.log(`✉️ [Email Sent] Successfully delivered to: ${to}`);
      console.log(`🔗 [Email Preview URL (Ethereal)]: ${previewUrl}`);
    } else {
      console.log(`✉️ [Email Sent] Successfully dispatched to: ${to} (Message ID: ${info.messageId})`);
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: previewUrl
    };
  } catch (err) {
    console.error(`❌ [Email Service] Failed to send password setup email to ${to}:`, err.message);
    return {
      success: false,
      error: err.message
    };
  }
}

/**
 * Returns diagnostic details about the current email service configuration.
 */
function getEmailServiceStatus() {
  const isConfigured = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);
  return {
    configured: isConfigured,
    mode: isConfigured ? 'Custom SMTP' : 'Dev / Ethereal Test Mailer',
    host: process.env.SMTP_HOST || 'smtp.ethereal.email (auto-generated)',
    from: process.env.SMTP_FROM || '"PiezoPulse IoT Platform" <no-reply@piezopulse.io>'
  };
}

module.exports = {
  sendSetPasswordEmail,
  getEmailServiceStatus
};
