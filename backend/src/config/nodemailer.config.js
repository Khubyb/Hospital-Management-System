import nodemailer from 'nodemailer';
import { env } from './env.js';

let transporter;

if (env.EMAIL_USER && env.EMAIL_PASS) {
  // Use real SMTP configuration
  transporter = nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT,
    secure: env.EMAIL_PORT === 465, // true for 465, false for other ports
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS
    }
  });

  // Verify the connection configuration
  transporter.verify((error, success) => {
    if (error) {
      console.warn(`[MAILER WARNING] SMTP Connection failed: ${error.message}. Emails will be logged to console instead.`);
      transporter = null;
    } else {
      console.log('[MAILER] SMTP Server is ready to deliver messages.');
    }
  });
} else {
  console.warn('[MAILER INFO] No email credentials provided. All emails will be logged to the console for development.');
}

export const getTransporter = () => transporter;
export const isMockEmail = () => !transporter;
export const emailFrom = env.EMAIL_FROM;
export const frontendUrl = env.FRONTEND_URL;
