import nodemailer from "nodemailer";

// Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendOtpEmail = async (toEmail, otp) => {
  await transporter.sendMail({
    from: `"Support" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: "Your Password Reset OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width:480px; margin:auto;">
        <h2>Password Reset Request</h2>

        <p>Your OTP is:</p>

        <h1 style="letter-spacing:4px;">
          ${otp}
        </h1>

        <p>
          This OTP is valid for <b>5 minutes</b>.
          If you did not request a password reset, please ignore this email.
        </p>
      </div>
    `,
  });
};

export default sendOtpEmail;