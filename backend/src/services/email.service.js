import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getTransporter, isMockEmail, emailFrom, frontendUrl } from '../config/nodemailer.config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to read email templates
const readTemplate = (fileName) => {
  try {
    const templatePath = path.join(__dirname, '../templates', fileName);
    return fs.readFileSync(templatePath, 'utf8');
  } catch (error) {
    console.error(`[EMAIL ERROR] Failed to read template ${fileName}:`, error);
    return '';
  }
};

/**
 * Send Verification Email
 */
export const sendVerificationEmail = async (email, name, token) => {
  const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;
  
  let html = readTemplate('verifyEmail.template.html');
  html = html.replace(/{{name}}/g, name).replace(/{{verificationUrl}}/g, verificationUrl);

  if (isMockEmail()) {
    console.log('\n==================================================');
    console.log(`[MOCK EMAIL SENT TO: ${email}]`);
    console.log(`Subject: Verify Your Email - Hospital Care`);
    console.log(`Verification URL: ${verificationUrl}`);
    console.log('==================================================\n');
    return { mock: true, url: verificationUrl };
  }

  const transporter = getTransporter();
  return await transporter.sendMail({
    from: emailFrom,
    to: email,
    subject: 'Verify Your Email - Hospital Care',
    html
  });
};

/**
 * Send Welcome Email
 */
export const sendWelcomeEmail = async (email, name, role) => {
  const loginUrl = `${frontendUrl}/login`;
  
  let html = readTemplate('welcomeEmail.template.html');
  html = html.replace(/{{name}}/g, name)
             .replace(/{{role}}/g, role.charAt(0).toUpperCase() + role.slice(1))
             .replace(/{{loginUrl}}/g, loginUrl);

  if (isMockEmail()) {
    console.log('\n==================================================');
    console.log(`[MOCK EMAIL SENT TO: ${email}]`);
    console.log(`Subject: Welcome to Hospital Care!`);
    console.log(`Login URL: ${loginUrl}`);
    console.log('==================================================\n');
    return { mock: true };
  }

  const transporter = getTransporter();
  return await transporter.sendMail({
    from: emailFrom,
    to: email,
    subject: 'Welcome to Hospital Care!',
    html
  });
};

/**
 * Send Password Reset Email
 */
export const sendPasswordResetEmail = async (email, name, token) => {
  const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
  
  let html = readTemplate('resetPassword.template.html');
  html = html.replace(/{{name}}/g, name).replace(/{{resetUrl}}/g, resetUrl);

  if (isMockEmail()) {
    console.log('\n==================================================');
    console.log(`[MOCK EMAIL SENT TO: ${email}]`);
    console.log(`Subject: Reset Your Password - Hospital Care`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log('==================================================\n');
    return { mock: true, url: resetUrl };
  }

  const transporter = getTransporter();
  return await transporter.sendMail({
    from: emailFrom,
    to: email,
    subject: 'Reset Your Password - Hospital Care',
    html
  });
};
