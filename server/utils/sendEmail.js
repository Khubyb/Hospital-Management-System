const nodemailer = require('nodemailer');

// Creates a reusable transporter using SMTP credentials from .env.
// Swap this for a transactional provider (SendGrid, SES) in production
// by changing only this file.
const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

// Generic sender used by every notification type in the app
const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();

  await transporter.sendMail({
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to,
    subject,
    html,
  });
};

// Pre-built OTP email template (verification or password reset)
const sendOTPEmail = async ({ to, name, otp, purpose }) => {
  const heading = purpose === 'reset_password' ? 'Reset your password' : 'Verify your email';
  const message =
    purpose === 'reset_password'
      ? 'Use the code below to reset your password. It expires in 10 minutes.'
      : 'Use the code below to verify your email and activate your account. It expires in 10 minutes.';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
      <h2 style="color: #0891b2;">${heading}</h2>
      <p>Hi ${name},</p>
      <p>${message}</p>
      <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 16px; background: #ecfeff; border-radius: 8px; color: #0e7490;">
        ${otp}
      </div>
      <p style="color: #64748b; font-size: 13px; margin-top: 24px;">If you did not request this, you can safely ignore this email.</p>
    </div>
  `;

  await sendEmail({ to, subject: heading, html });
};

module.exports = { sendEmail, sendOTPEmail };
