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

/**
 * Send Customer Order Invoice with PDF Attachment
 */
export async function sendInvoiceEmail({ to, customerName, orderNumber, invoiceNumber, totalAmount, pdfBuffer }) {
  const subject = 'Your Slidescoiety Order Invoice';
  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(Number(totalAmount));

  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #080002; color: #f5f6f2; padding: 40px; border-radius: 12px; max-width: 600px; margin: auto;">
      <h1 style="color: #e50914; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">SLIDESCOIETY</h1>
      <p style="font-size: 14px; color: #a3a3a3; margin-top: 0; text-transform: uppercase;">Sim Racing Store</p>
      <hr style="border: none; border-top: 1px solid #262626; margin: 24px 0;" />
      
      <h2 style="color: #ffffff; margin-bottom: 12px;">Payment Confirmed!</h2>
      <p style="color: #d4d4d4; font-size: 14px; line-height: 1.6;">
        Dear <strong>${customerName || 'Driver'}</strong>,
      </p>
      <p style="color: #d4d4d4; font-size: 14px; line-height: 1.6;">
        Thank you for your order with Slidescoiety. Your payment has been successfully captured and verified.
        Your official order invoice <strong>${invoiceNumber}</strong> is attached to this email as a PDF.
      </p>

      <div style="background-color: #121212; border: 1px solid #262626; border-radius: 8px; padding: 20px; margin: 24px 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #d4d4d4;">
          <tr>
            <td style="padding: 6px 0; color: #a3a3a3;">Order Number:</td>
            <td style="padding: 6px 0; font-weight: bold; color: #ffffff; text-align: right;">${orderNumber}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #a3a3a3;">Invoice Number:</td>
            <td style="padding: 6px 0; font-weight: bold; color: #e50914; text-align: right;">${invoiceNumber}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #a3a3a3;">Total Amount Paid:</td>
            <td style="padding: 6px 0; font-weight: bold; color: #ffffff; text-align: right;">${formattedAmount}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #a3a3a3;">Payment Status:</td>
            <td style="padding: 6px 0; font-weight: bold; color: #10b981; text-align: right;">CAPTURED (Verified)</td>
          </tr>
        </table>
      </div>

      <p style="color: #a3a3a3; font-size: 13px; line-height: 1.6;">
        Your sim racing cockpit hardware has entered our queue for preparation and dispatch. You can track live telemetry and status history directly inside your Driver Account portal.
      </p>

      <hr style="border: none; border-top: 1px solid #262626; margin: 24px 0;" />
      
      <p style="color: #737373; font-size: 12px; margin: 0;">
        Questions or custom setup adjustments? Contact our pit crew at
        <a href="mailto:${env.SELLER_EMAIL}" style="color: #e50914; text-decoration: none;">${env.SELLER_EMAIL}</a>.
      </p>
      <p style="color: #525252; font-size: 11px; margin-top: 12px;">
        Slidescoiety Sim Racing Store &bull; Professional Cockpits &bull; Build / Race / Upgrade
      </p>
    </div>
  `;

  const attachments = pdfBuffer ? [{
    filename: `${invoiceNumber}.pdf`,
    content: pdfBuffer,
    contentType: 'application/pdf'
  }] : [];

  if (transporter) {
    try {
      await transporter.sendMail({
        from: env.EMAIL_FROM,
        to,
        subject,
        html,
        attachments
      });
      logger.info(`Invoice email with PDF sent to customer [${to}] for Order [${orderNumber}]`);
      return { sent: true, provider: 'smtp' };
    } catch (err) {
      logger.error(`SMTP delivery of invoice to [${to}] failed: ${err.message}`);
      return { sent: false, error: err.message };
    }
  }

  // Development simulation: log clear warning without pretending SMTP succeeded
  logger.warn(`[DEV-EMAIL] SMTP not configured. Simulated customer invoice email for [${to}], Order [${orderNumber}], Invoice [${invoiceNumber}]`);
  return {
    sent: false,
    simulated: true,
    message: 'SMTP not configured in development environment. Invoice email simulated.'
  };
}

/**
 * Send Admin Notification for New Paid Order
 */
export async function sendAdminOrderNotification({ order, payment, invoice }) {
  const adminRecipient = env.ADMIN_NOTIFICATION_EMAIL || 'orders@slidescoiety.com';
  const subject = 'New Paid Order — Slidescoiety';

  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(Number(order.totalAmount));

  const itemsHtml = (order.items || []).map(it => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #262626; color: #ffffff;">${it.productName}</td>
      <td style="padding: 8px; border-bottom: 1px solid #262626; text-align: center; color: #a3a3a3;">${it.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #262626; text-align: right; color: #ffffff;">₹${Number(it.lineTotal).toLocaleString('en-IN')}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #0d0d0d; color: #f5f6f2; padding: 30px; border-radius: 8px; max-width: 650px; margin: auto;">
      <h2 style="color: #e50914; margin-top: 0; text-transform: uppercase;">New Paid Order Received</h2>
      <p style="color: #a3a3a3; font-size: 13px;">A customer has completed payment and an order is ready for fulfillment.</p>
      
      <div style="background-color: #171717; border: 1px solid #333333; border-radius: 6px; padding: 16px; margin: 20px 0; font-size: 13px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 4px 0; color: #888888; width: 140px;">Order Number:</td>
            <td style="padding: 4px 0; font-weight: bold; color: #ffffff;">${order.orderNumber}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #888888;">Invoice Number:</td>
            <td style="padding: 4px 0; font-weight: bold; color: #e50914;">${invoice?.invoiceNumber || 'PENDING'}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #888888;">Customer:</td>
            <td style="padding: 4px 0; color: #ffffff;">${order.user?.fullName || 'Customer'} (${order.user?.email || 'N/A'})</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #888888;">Amount Received:</td>
            <td style="padding: 4px 0; font-weight: bold; color: #10b981;">${formattedAmount}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #888888;">Payment Reference:</td>
            <td style="padding: 4px 0; font-family: monospace; color: #ffffff;">${payment?.providerPaymentId || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #888888;">Order Date:</td>
            <td style="padding: 4px 0; color: #ffffff;">${new Date(order.createdAt).toLocaleString()}</td>
          </tr>
        </table>
      </div>

      <h4 style="color: #ffffff; margin-bottom: 8px;">Ordered Components</h4>
      <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 24px;">
        <thead>
          <tr style="background-color: #222222;">
            <th style="padding: 8px; text-align: left; color: #888888;">Product</th>
            <th style="padding: 8px; text-align: center; color: #888888;">Qty</th>
            <th style="padding: 8px; text-align: right; color: #888888;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <p style="color: #666666; font-size: 11px; margin: 0;">
        Slidescoiety Internal Admin Dispatch Notification &bull; Sensitive customer data protected
      </p>
    </div>
  `;

  if (transporter) {
    try {
      await transporter.sendMail({
        from: env.EMAIL_FROM,
        to: adminRecipient,
        subject,
        html
      });
      logger.info(`Admin notification email sent to [${adminRecipient}] for Order [${order.orderNumber}]`);
      return { sent: true, provider: 'smtp' };
    } catch (err) {
      logger.error(`SMTP delivery of admin notification to [${adminRecipient}] failed: ${err.message}`);
      return { sent: false, error: err.message };
    }
  }

  // Development simulation: log notification clearly
  logger.warn(`[DEV-EMAIL] SMTP not configured. Simulated admin notification for Order [${order.orderNumber}], Total: ${formattedAmount}`);
  return {
    sent: false,
    simulated: true,
    message: 'SMTP not configured in development environment. Admin notification simulated.'
  };
}

/**
 * Send Customer Shipping Notification Email
 * Triggered on shipment lifecycle events: SHIPPED, OUT_FOR_DELIVERY, DELIVERED, DELIVERY_FAILED, RETURN_TO_SENDER
 */
export async function sendShippingNotificationEmail({ to, customerName, order, shipment, eventType, notes, failureReason }) {
  if (!to) {
    logger.warn('Skipping shipping notification: No recipient email address provided.');
    return { sent: false, error: 'NO_RECIPIENT' };
  }

  let subject = `Slidescoiety Shipping Update — Order ${order.orderNumber}`;
  let headline = 'Shipment Status Update';
  let badgeColor = '#3b82f6';
  let statusText = shipment.status.replace(/_/g, ' ');

  switch (eventType) {
    case 'SHIPPED':
      subject = `Dispatched: Slidescoiety Order [${order.orderNumber}] is on the way`;
      headline = 'Hardware In Motion: Your Rig Has Dispatched';
      badgeColor = '#06b6d4';
      statusText = 'DISPATCHED';
      break;
    case 'OUT_FOR_DELIVERY':
      subject = `Out for Delivery: Slidescoiety Order [${order.orderNumber}]`;
      headline = 'Approaching Final Sector: Out for Delivery Today';
      badgeColor = '#0284c7';
      statusText = 'OUT FOR DELIVERY';
      break;
    case 'DELIVERED':
      subject = `Delivered: Slidescoiety Order [${order.orderNumber}]`;
      headline = 'P1 Finish: Hardware Successfully Delivered';
      badgeColor = '#10b981';
      statusText = 'DELIVERED';
      break;
    case 'DELIVERY_FAILED':
      subject = `Delivery Exception Notice: Slidescoiety Order [${order.orderNumber}]`;
      headline = 'Delivery Attempt Exception';
      badgeColor = '#e11d48';
      statusText = 'DELIVERY FAILED';
      break;
    case 'RETURN_TO_SENDER':
      subject = `Shipment Return Notice: Slidescoiety Order [${order.orderNumber}]`;
      headline = 'Shipment Returning to Depot';
      badgeColor = '#f59e0b';
      statusText = 'RETURN TO SENDER';
      break;
  }

  const trackingLinkHtml = shipment.trackingUrl
    ? `<a href="${shipment.trackingUrl}" target="_blank" rel="noopener noreferrer" style="color: #e50914; font-weight: bold; text-decoration: underline;">${shipment.trackingNumber}</a>`
    : `<span style="color: #ffffff; font-family: monospace; font-weight: bold;">${shipment.trackingNumber}</span>`;

  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #080002; color: #f5f6f2; padding: 40px; border-radius: 12px; max-width: 600px; margin: auto;">
      <h1 style="color: #e50914; margin-bottom: 4px; text-transform: uppercase; font-size: 24px; letter-spacing: 1px;">SLIDESCOIETY</h1>
      <p style="font-size: 13px; color: #a3a3a3; margin-top: 0; text-transform: uppercase; letter-spacing: 2px;">PREMIUM SIM RACING STORE</p>
      <hr style="border: none; border-top: 1px solid #262626; margin: 20px 0;" />
      
      <div style="display: inline-block; padding: 4px 10px; border-radius: 4px; background-color: ${badgeColor}22; border: 1px solid ${badgeColor}; color: ${badgeColor}; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 16px;">
        ${statusText}
      </div>

      <h2 style="color: #ffffff; margin-top: 0; font-size: 20px;">${headline}</h2>
      <p style="color: #d4d4d4; font-size: 14px; line-height: 1.6;">
        Hello <strong>${customerName || 'Driver'}</strong>, here is the latest logistics update for your Slidescoiety order <strong>${order.orderNumber}</strong>.
      </p>

      <div style="background-color: #121212; border: 1px solid #262626; border-radius: 8px; padding: 20px; margin: 24px 0;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 6px 0; color: #888888; width: 140px;">Order Number:</td>
            <td style="padding: 6px 0; font-weight: bold; color: #ffffff;">${order.orderNumber}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #888888;">Courier Partner:</td>
            <td style="padding: 6px 0; font-weight: bold; color: #ffffff;">${shipment.courierName}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #888888;">Tracking Reference:</td>
            <td style="padding: 6px 0;">${trackingLinkHtml}</td>
          </tr>
          ${shipment.estimatedDeliveryAt ? `
          <tr>
            <td style="padding: 6px 0; color: #888888;">Estimated Delivery:</td>
            <td style="padding: 6px 0; color: #ffffff;">${new Date(shipment.estimatedDeliveryAt).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</td>
          </tr>` : ''}
          ${failureReason ? `
          <tr>
            <td style="padding: 6px 0; color: #ef4444;">Exception Reason:</td>
            <td style="padding: 6px 0; color: #fca5a5; font-weight: bold;">${failureReason}</td>
          </tr>` : ''}
          ${notes ? `
          <tr>
            <td style="padding: 6px 0; color: #888888;">Dispatcher Notes:</td>
            <td style="padding: 6px 0; color: #d4d4d4; font-style: italic;">"${notes}"</td>
          </tr>` : ''}
        </table>
      </div>

      ${shipment.trackingUrl ? `
      <div style="text-align: center; margin: 28px 0;">
        <a href="${shipment.trackingUrl}" target="_blank" rel="noopener noreferrer" style="background-color: #e50914; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 9999px; font-weight: bold; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block;">
          Track Live Consignment
        </a>
      </div>` : ''}

      <hr style="border: none; border-top: 1px solid #262626; margin: 24px 0;" />
      <p style="color: #737373; font-size: 12px; line-height: 1.5;">
        Need assistance with your delivery? Contact our pit crew at
        <a href="mailto:${env.SELLER_EMAIL}" style="color: #e50914; text-decoration: none;">${env.SELLER_EMAIL}</a>.
      </p>
      <p style="color: #525252; font-size: 11px; margin-top: 12px;">
        Slidescoiety Sim Racing Store &bull; Professional Cockpits &bull; Build / Race / Upgrade
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
      logger.info(`Shipping notification [${eventType}] delivered via SMTP to [${to}] for Order [${order.orderNumber}]`);
      return { sent: true, provider: 'smtp' };
    } catch (err) {
      logger.error(`SMTP delivery of shipping notification to [${to}] failed: ${err.message}`);
      return { sent: false, error: err.message };
    }
  }

  // Development simulation: log notification clearly
  logger.info(`[DEV-EMAIL] Simulated customer shipping notification [${eventType}] for [${to}], Order [${order.orderNumber}], Tracking: [${shipment.trackingNumber}]`);
  return {
    sent: false,
    simulated: true,
    message: 'SMTP not configured in development environment. Shipping notification simulated.'
  };
}



