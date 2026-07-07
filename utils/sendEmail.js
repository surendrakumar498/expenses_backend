import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendOtpEmail(toEmail, otp) {
  await resend.emails.send({
    from: "onboarding@resend.dev", // testing ke liye ye default domain use karo
    to: toEmail,
    subject: "Your Password Reset OTP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
        <h2>Password Reset Request</h2>
        <p>Aapka OTP hai:</p>
        <h1 style="letter-spacing: 4px;">${otp}</h1>
        <p>Ye OTP <b>5 minute</b> ke liye valid hai. Agar aapne ye request nahi ki, is email ko ignore kar dijiye.</p>
      </div>
    `,
  });
}

export default sendOtpEmail;