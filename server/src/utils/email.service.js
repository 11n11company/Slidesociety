import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from './logger.js';

let transporter = null;

// Initialize transporter if SMTP configuration is provided
if (env.EMAIL_HOST && env.EMAIL_USER && env.EMAIL_PASS) {
  try {
    transporter = nodemailer.createTransport({
      host: env.EMAIL_HOST,
      port: env.EMAIL_PORT,
      secure: env.EMAIL_SECURE,
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS
      }
    });
    logger.info(`Transactional email service initialized with host [${env.EMAIL_HOST}]`);
  } catch (err) {
    logger.warn('Failed to initialize SMTP transporter:', err.message);
  }
}

/**
 * Send Email Verification Token
 */
export async function sendVerificationEmail({ to, fullName, verificationToken }) {
  const verifyUrl = `${env.FRONTEND_URL}/#verify-email?token=${verificationToken}&email=${encodeURIComponent(to)}`;

  const subject = 'Verify your Slidescoiety Driver Account';
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #080002; color: #f5f6f2; padding: 40px; border-radius: 12px; max-width: 600px; margin: auto;">
      <h1 style="color: #e50914; margin-bottom: 8px; text-transform: uppercase;">SLIDESCOIETY</h1>
      <p style="font-size: 14px; color: #a3a3a3; margin-top: 0;">SIM RACING STORE</p>
      <hr style="border: none; border-top: 1px solid #262626; margin: 24px 0;" />
      <h2 style="color: #ffffff;">Welcome to the Grid, ${fullName}!</h2>
      <p style="color: #d4d4d4; font-size: 14px; line-height: 1.6;">
        Thank you for creating your Slidescoiety Driver Account. To verify your email address and activate your account, click the button below:
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${verifyUrl}" style="background-color: #e50914; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 9999px; font-weight: bold; font-size: 14px; display: inline-block;">
          Verify Email Address
        </a>
      </div>
      <p style="color: #737373; font-size: 12px;">
        Or copy and paste this verification token into the driver portal:
        <br />
        <code style="background-color: #171717; color: #e50914; padding: 4px 8px; border-radius: 4px; font-size: 14px; display: inline-block; margin-top: 6px;">${verificationToken}</code>
      </p>
      <p style="color: #737373; font-size: 11px; margin-top: 24px;">
        If you did not register for Slidescoiety, please disregard this email.
      </p>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: env.EMAIL_FROM,
        to,
        subject,
        html
      });
      logger.info(`Verification email sent to [${to}]`);
      return { sent: true, provider: 'smtp' };
    } catch (err) {
      logger.error(`SMTP delivery failed for [${to}]: ${err.message}`);
      return { sent: false, error: err.message };
    }
  }

  // Development simulation: log verification details clearly without pretending SMTP succeeded
  logger.info(`[DEV-EMAIL] Verification link for [${to}]: ${verifyUrl}`);
  logger.info(`[DEV-EMAIL] Token: [${verificationToken}]`);
  return {
    sent: false,
    simulated: true,
    verificationToken,
    verifyUrl,
    message: 'SMTP not configured in development environment. Token logged for testing.'
  };
}

/**
 * Send Password Reset Token
 */
export async function sendPasswordResetEmail({ to, fullName, resetToken }) {
  const resetUrl = `${env.FRONTEND_URL}/#reset-password?token=${resetToken}&email=${encodeURIComponent(to)}`;

  const subject = 'Slidescoiety Driver Account Password Reset Request';
  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #080002; color: #f5f6f2; padding: 40px; border-radius: 12px; max-width: 600px; margin: auto;">
      <h1 style="color: #e50914; margin-bottom: 8px; text-transform: uppercase;">SLIDESCOIETY</h1>
      <p style="font-size: 14px; color: #a3a3a3; margin-top: 0;">SIM RACING STORE</p>
      <hr style="border: none; border-top: 1px solid #262626; margin: 24px 0;" />
      <h2 style="color: #ffffff;">Password Reset Request</h2>
      <p style="color: #d4d4d4; font-size: 14px; line-height: 1.6;">
        We received a request to reset the password for your Slidescoiety driver account (${to}). This link is valid for 1 hour.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${resetUrl}" style="background-color: #e50914; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 9999px; font-weight: bold; font-size: 14px; display: inline-block;">
          Reset My Password
        </a>
      </div>
      <p style="color: #737373; font-size: 12px;">
        Or enter this single-use reset token in the account portal:
        <br />
        <code style="background-color: #171717; color: #e50914; padding: 4px 8px; border-radius: 4px; font-size: 14px; display: inline-block; margin-top: 6px;">${resetToken}</code>
      </p>
      <p style="color: #737373; font-size: 11px; margin-top: 24px;">
        If you did not make this request, you can safely ignore this email. Your password remains unchanged.
      </p>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: env.EMAIL_FROM,
        to,
        subject,
        html
      });
      logger.info(`Password reset email sent to [${to}]`);
      return { sent: true, provider: 'smtp' };
    } catch (err) {
      logger.error(`SMTP delivery failed for [${to}]: ${err.message}`);
      return { sent: false, error: err.message };
    }
  }

  // Development simulation: log reset link clearly
  logger.info(`[DEV-EMAIL] Password reset link for [${to}]: ${resetUrl}`);
  logger.info(`[DEV-EMAIL] Reset Token: [${resetToken}]`);
  return {
    sent: false,
    simulated: true,
    resetToken,
    resetUrl,
    message: 'SMTP not configured in development environment. Token logged for testing.'
  };
}
