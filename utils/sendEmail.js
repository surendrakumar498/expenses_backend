
// export default sendOtpEmail;
import nodemailer from "nodemailer";

let transporter = null;

// Lazily creates and caches the transporter, and validates required env vars.
function getTransporter() {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    throw new Error(
      "Missing SMTP configuration. Please set SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASS in your environment variables."
    );
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  return transporter;
}

// Generic, reusable sender with consistent error handling and logging.
async function sendMail({ to, subject, html, fromLabel = "Finance Tracker" }) {
  if (!to) {
    throw new Error("sendMail: 'to' address is required.");
  }

  try {
    const mailer = getTransporter();

    const info = await mailer.sendMail({
      from: `"${fromLabel}" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    return info;
  } catch (err) {
    console.error(`sendMail failed (to: ${to}, subject: "${subject}"):`, err.message);
    throw err;
  }
}

// ===== Shared email layout (wraps every email in a consistent branded shell) =====
function emailShell({ preheader = "", bodyHtml = "" }) {
  return `
  <!DOCTYPE html>
  <html>
    <body style="margin:0; padding:0; background-color:#f4f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <span style="display:none; max-height:0; overflow:hidden;">${preheader}</span>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f9; padding: 32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color:#ffffff; border-radius: 12px; overflow:hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.06);">

              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #4a3aff, #6c5ce7); padding: 28px 32px;">
                  <span style="color:#ffffff; font-size: 20px; font-weight: 700; letter-spacing: 0.3px;">
                     Finance Tracker
                  </span>
                </td>
              </tr>

              <!-- Body -->
              <tr>
                <td style="padding: 32px;">
                  ${bodyHtml}
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="padding: 20px 32px; background-color:#fafafa; border-top: 1px solid #eeeeee;">
                  <p style="margin:0; font-size: 12px; color: #999999; text-align:center;">
                    This is an automated email from Finance Tracker. Please do not reply.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
  `;
}

// ---------- OTP Email (forgot password) ----------
export async function sendOtpEmail(toEmail, otp) {
  if (!toEmail || !otp) {
    throw new Error("sendOtpEmail: 'toEmail' and 'otp' are required.");
  }

  const bodyHtml = `
    <h2 style="margin: 0 0 8px; font-size: 20px; color: #1a1a1a;">Password Reset Request</h2>
    <p style="margin: 0 0 24px; font-size: 14px; color: #555555; line-height: 1.6;">
      We received a request to reset your password. Use the code below to continue. This code is valid for
      <b>5 minutes</b>.
    </p>

    <div style="background-color: #f4f2ff; border-radius: 10px; padding: 20px; text-align: center; margin-bottom: 24px;">
      <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #4a3aff;">
        ${otp}
      </span>
    </div>

    <p style="margin: 0; font-size: 13px; color: #999999; line-height: 1.6;">
      If you didn't request a password reset, you can safely ignore this email — your password will remain unchanged.
    </p>
  `;

  return sendMail({
    to: toEmail,
    subject: "Your Password Reset OTP",
    html: emailShell({ preheader: `Your OTP is ${otp}`, bodyHtml }),
    fromLabel: "Finance Tracker Support",
  });
}

// ---------- New User Registered Notification (sent to admin) ----------
export async function sendNewUserNotification(adminEmail, newUser) {
  if (!adminEmail) {
    throw new Error("sendNewUserNotification: 'adminEmail' is required (check ADMIN_EMAIL env var).");
  }
  if (!newUser?.name || !newUser?.email) {
    throw new Error("sendNewUserNotification: 'newUser' must include name and email.");
  }

  const initial = newUser.name.charAt(0).toUpperCase();

  const bodyHtml = `
    <h2 style="margin: 0 0 8px; font-size: 20px; color: #1a1a1a;">🎉 New User Registered</h2>
    <p style="margin: 0 0 24px; font-size: 14px; color: #555555; line-height: 1.6;">
      A new user just signed up on Finance Tracker.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #f9f9fb; border-radius: 10px; padding: 16px;">
      <tr>
        <td style="width: 48px; vertical-align: top;">
          <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #4a3aff, #6c5ce7); color: #ffffff; font-weight: 700; font-size: 16px; text-align: center; line-height: 40px;">
            ${initial}
          </div>
        </td>
        <td style="vertical-align: top; padding-left: 12px;">
          <p style="margin: 0; font-size: 15px; font-weight: 600; color: #1a1a1a;">${newUser.name}</p>
          <p style="margin: 2px 0 0; font-size: 13px; color: #666666;">${newUser.email}</p>
        </td>
      </tr>
    </table>
  `;

  return sendMail({
    to: adminEmail,
    subject: `New User Registered: ${newUser.name}`,
    html: emailShell({ preheader: `${newUser.name} just signed up`, bodyHtml }),
    fromLabel: "Finance Tracker Notifications",
  });
}

export default sendOtpEmail;