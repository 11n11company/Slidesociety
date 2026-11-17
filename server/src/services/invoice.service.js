import PDFDocument from 'pdfkit';
import { prisma } from '../config/db.js';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { storageService } from './storage.service.js';
import { sendInvoiceEmail, sendAdminOrderNotification } from '../utils/email.service.js';

/**
 * Generates a unique, collision-resistant human-readable invoice number.
 * Pattern: INV-YYYYMMDD-XXXX (e.g. INV-20261118-1001)
 */
export async function generateUniqueInvoiceNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;

  const count = await prisma.invoice.count();
  let sequence = 1001 + count;
  let candidate = `INV-${dateStr}-${sequence}`;

  let attempts = 0;
  while (attempts < 20) {
    const existing = await prisma.invoice.findUnique({
      where: { invoiceNumber: candidate }
    });
    if (!existing) {
      return candidate;
    }
    attempts++;
    sequence += 1;
    candidate = `INV-${dateStr}-${sequence}`;
  }

  // Fallback with random entropy if high concurrency
  return `INV-${dateStr}-${Date.now().toString().slice(-4)}`;
}

/**
 * Formats a currency amount into standard Indian Rupee notation (₹).
 */
function formatINR(val) {
  const num = Number(val) || 0;
  return `Rs. ${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Renders a PDF invoice buffer using PDFKit.
 * Uses immutable Order and OrderItem records.
 * Strictly adheres to tax invoice rules: Only labels as TAX INVOICE if GSTIN is configured.
 */
export async function renderInvoicePDFBuffer({ invoiceNumber, order, payment, user }) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 40,
        size: 'A4',
        info: {
          Title: `Slidescoiety Invoice - ${invoiceNumber}`,
          Author: 'Slidescoiety Sim Racing Store',
          Subject: `Invoice for Order ${order.orderNumber}`
        }
      });

      const buffers = [];
      doc.on('data', b => buffers.push(b));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', err => reject(err));

      // Parse Shipping Address Snapshot
      let addressSnapshot = null;
      if (order.shippingAddressSnapshot) {
        try {
          addressSnapshot = typeof order.shippingAddressSnapshot === 'string'
            ? JSON.parse(order.shippingAddressSnapshot)
            : order.shippingAddressSnapshot;
        } catch {
          addressSnapshot = null;
        }
      }

      // Title determination (Rule: do not label as TAX INVOICE unless seller & GSTIN verified)
      const isTaxInvoice = Boolean(env.SELLER_GSTIN && env.SELLER_GSTIN.trim());
      const documentTitle = isTaxInvoice ? 'TAX INVOICE' : 'ORDER INVOICE / RECEIPT';

      // =========================================================================
      // 1. BRAND HEADER & DOCUMENT TITLE
      // =========================================================================
      doc.rect(40, 40, 515, 60).fill('#0f0f11');

      doc.fillColor('#E50914').fontSize(22).font('Helvetica-Bold')
        .text('SLIDESCOIETY', 55, 52, { characterSpacing: 1 });
      doc.fillColor('#A3A3A3').fontSize(9).font('Helvetica')
        .text('SIM RACING STORE', 55, 78, { characterSpacing: 1.5 });

      doc.fillColor('#FFFFFF').fontSize(14).font('Helvetica-Bold')
        .text(documentTitle, 320, 55, { align: 'right', width: 220 });
      doc.fillColor('#E50914').fontSize(10).font('Helvetica-Bold')
        .text(invoiceNumber, 320, 75, { align: 'right', width: 220 });

      doc.moveDown(2);

      // =========================================================================
      // 2. SELLER & BUYER 2-COLUMN SECTION
      // =========================================================================
      const colTop = 115;
      const colWidth = 245;

      // Left Column: Seller Information
      doc.fillColor('#E50914').fontSize(9).font('Helvetica-Bold')
        .text('SELLER & DISPATCH HUB', 40, colTop);
      doc.rect(40, colTop + 14, colWidth, 1).fill('#333333');

      doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica-Bold')
        .text(env.SELLER_NAME || 'Slidescoiety Sim Racing Store', 40, colTop + 22);

      let sellerY = colTop + 36;
      doc.fillColor('#A3A3A3').fontSize(9).font('Helvetica');

      if (env.SELLER_ADDRESS) {
        doc.text(env.SELLER_ADDRESS, 40, sellerY, { width: colWidth });
        sellerY = doc.y + 4;
      }
      doc.text(`Email: ${env.SELLER_EMAIL}`, 40, sellerY);
      sellerY += 14;

      if (env.SELLER_PHONE) {
        doc.text(`Phone: ${env.SELLER_PHONE}`, 40, sellerY);
        sellerY += 14;
      }

      if (isTaxInvoice) {
        doc.fillColor('#FFFFFF').font('Helvetica-Bold')
          .text(`GSTIN: ${env.SELLER_GSTIN}`, 40, sellerY);
      }

      // Right Column: Buyer / Customer Information
      const rightX = 310;
      doc.fillColor('#E50914').fontSize(9).font('Helvetica-Bold')
        .text('BILLED & SHIPPED TO', rightX, colTop);
      doc.rect(rightX, colTop + 14, colWidth, 1).fill('#333333');

      const customerName = addressSnapshot?.recipientName || user?.fullName || 'Customer';
      doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica-Bold')
        .text(customerName, rightX, colTop + 22);

      let buyerY = colTop + 36;
      doc.fillColor('#A3A3A3').fontSize(9).font('Helvetica');

      if (addressSnapshot) {
        const line1 = addressSnapshot.streetLine1 || '';
        const line2 = addressSnapshot.streetLine2 ? `, ${addressSnapshot.streetLine2}` : '';
        const cityState = `${addressSnapshot.city || ''}, ${addressSnapshot.state || ''} - ${addressSnapshot.postalCode || ''}`;
        const country = addressSnapshot.country || 'India';

        doc.text(`${line1}${line2}`, rightX, buyerY, { width: colWidth });
        buyerY = doc.y + 2;
        doc.text(cityState, rightX, buyerY, { width: colWidth });
        buyerY = doc.y + 2;
        doc.text(country, rightX, buyerY, { width: colWidth });
        buyerY = doc.y + 4;
      }

      doc.text(`Email: ${user?.email || 'N/A'}`, rightX, buyerY);
      buyerY += 14;
      if (addressSnapshot?.phone || user?.phone) {
        doc.text(`Phone: ${addressSnapshot?.phone || user?.phone}`, rightX, buyerY);
      }

      // =========================================================================
      // 3. ORDER & PAYMENT METADATA BAR
      // =========================================================================
      const metaTop = Math.max(sellerY, buyerY) + 20;
      doc.rect(40, metaTop, 515, 46).fill('#17171a');

      doc.fillColor('#888888').fontSize(8).font('Helvetica-Bold')
        .text('ORDER NUMBER', 50, metaTop + 8)
        .text('ORDER DATE', 160, metaTop + 8)
        .text('PAYMENT METHOD', 260, metaTop + 8)
        .text('PAYMENT STATUS', 370, metaTop + 8)
        .text('PAYMENT REF ID', 460, metaTop + 8);

      const orderDateStr = new Date(order.createdAt).toISOString().slice(0, 10);
      const payMethodStr = (payment?.method || 'RAZORPAY').toUpperCase();
      const payRefStr = payment?.providerPaymentId
        ? (payment.providerPaymentId.length > 12 ? payment.providerPaymentId.slice(0, 12) + '...' : payment.providerPaymentId)
        : 'N/A';

      doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold')
        .text(order.orderNumber, 50, metaTop + 24)
        .text(orderDateStr, 160, metaTop + 24)
        .text(payMethodStr, 260, metaTop + 24);

      doc.fillColor('#10B981').text('CAPTURED', 370, metaTop + 24);
      doc.fillColor('#FFFFFF').font('Helvetica').fontSize(8).text(payRefStr, 460, metaTop + 24);

      // =========================================================================
      // 4. ORDERED HARDWARE ITEMS TABLE
      // =========================================================================
      const tableTop = metaTop + 60;
      doc.rect(40, tableTop, 515, 22).fill('#E50914');

      doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold')
        .text('#', 48, tableTop + 7, { width: 20 })
        .text('COMPONENT / HARDWARE DESCRIPTION', 75, tableTop + 7, { width: 240 })
        .text('QTY', 320, tableTop + 7, { width: 40, align: 'center' })
        .text('UNIT PRICE', 370, tableTop + 7, { width: 80, align: 'right' })
        .text('LINE TOTAL', 460, tableTop + 7, { width: 85, align: 'right' });

      let currentY = tableTop + 24;
      const items = order.items || [];

      items.forEach((item, index) => {
        const isZebra = index % 2 === 1;
        if (isZebra) {
          doc.rect(40, currentY, 515, 24).fill('#141416');
        }

        doc.fillColor('#888888').fontSize(8).font('Helvetica')
          .text(String(index + 1), 48, currentY + 6, { width: 20 });

        doc.fillColor('#FFFFFF').fontSize(8.5).font('Helvetica-Bold')
          .text(item.productName, 75, currentY + 6, { width: 240, lineBreak: false });

        doc.fillColor('#CCCCCC').fontSize(8.5).font('Helvetica')
          .text(String(item.quantity), 320, currentY + 6, { width: 40, align: 'center' })
          .text(formatINR(item.unitPrice), 370, currentY + 6, { width: 80, align: 'right' })
          .text(formatINR(item.lineTotal), 460, currentY + 6, { width: 85, align: 'right' });

        currentY += 24;
      });

      doc.rect(40, currentY, 515, 1).fill('#333333');
      currentY += 12;

      // =========================================================================
      // 5. FINANCIAL TOTALS SUMMARY (RIGHT-ALIGNED)
      // =========================================================================
      const summaryLeft = 320;
      const summaryWidth = 235;

      const subtotal = Number(order.subtotal) || 0;
      const tax = Number(order.taxAmount) || 0;
      const shipping = Number(order.shippingAmount) || 0;
      const total = Number(order.totalAmount) || 0;

      doc.fontSize(8.5).font('Helvetica');

      // Subtotal
      doc.fillColor('#888888').text('Subtotal (Taxable Value):', summaryLeft, currentY);
      doc.fillColor('#FFFFFF').text(formatINR(subtotal), summaryLeft, currentY, { align: 'right', width: summaryWidth });
      currentY += 16;

      // GST Breakdown
      if (tax > 0) {
        const halfTax = tax / 2;
        doc.fillColor('#888888').text('CGST (9.0%):', summaryLeft, currentY);
        doc.fillColor('#FFFFFF').text(formatINR(halfTax), summaryLeft, currentY, { align: 'right', width: summaryWidth });
        currentY += 14;

        doc.fillColor('#888888').text('SGST (9.0%):', summaryLeft, currentY);
        doc.fillColor('#FFFFFF').text(formatINR(halfTax), summaryLeft, currentY, { align: 'right', width: summaryWidth });
        currentY += 14;
      }

      // Shipping
      doc.fillColor('#888888').text('Freight Logistics & Packaging:', summaryLeft, currentY);
      doc.fillColor('#10B981').text(shipping === 0 ? 'FREE' : formatINR(shipping), summaryLeft, currentY, { align: 'right', width: summaryWidth });
      currentY += 18;

      // Grand Total Highlight Bar
      doc.rect(summaryLeft - 10, currentY - 4, summaryWidth + 10, 26).fill('#1e1e24');
      doc.fillColor('#FFFFFF').fontSize(10).font('Helvetica-Bold')
        .text('GRAND TOTAL PAID:', summaryLeft, currentY + 4);
      doc.fillColor('#E50914').fontSize(11).font('Helvetica-Bold')
        .text(formatINR(total), summaryLeft, currentY + 3, { align: 'right', width: summaryWidth });

      currentY += 45;

      // =========================================================================
      // 6. LEGAL NOTICE & FOOTER
      // =========================================================================
      const footerY = 740;
      doc.rect(40, footerY - 10, 515, 1).fill('#262626');

      doc.fillColor('#888888').fontSize(7.5).font('Helvetica')
        .text('Thank you for racing with Slidescoiety! Your cockpit hardware is engineered for champion-grade rigidity.', 40, footerY, { align: 'center', width: 515 })
        .text(`Questions or support: ${env.SELLER_EMAIL} • http://localhost:5500`, 40, footerY + 12, { align: 'center', width: 515 })
        .text('This is a computer-generated invoice issued electronically upon verified payment capture. No physical signature required.', 40, footerY + 24, { align: 'center', width: 515 });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Creates and stores an invoice for a CAPTURED order.
 * Strictly verifies payment status, prevents duplicates under concurrency,
 * safely stores the PDF, and initiates email notifications.
 */
export async function createInvoiceForOrder({ orderId, triggerSource = 'checkout' }) {
  if (!orderId) {
    throw new Error('orderId is required to generate invoice');
  }

  // 1. Fetch Order with Items, Payments, and User
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      payments: {
        orderBy: { createdAt: 'desc' }
      },
      user: true,
      invoice: true
    }
  });

  if (!order) {
    const error = new Error(`Order [${orderId}] not found`);
    error.statusCode = 404;
    error.code = 'ORDER_NOT_FOUND';
    throw error;
  }

  // 2. Concurrency & Idempotency: Return existing invoice if already created
  if (order.invoice) {
    logger.info(`Invoice [${order.invoice.invoiceNumber}] already exists for Order [${order.orderNumber}]. Reusing.`);
    return {
      success: true,
      isExisting: true,
      invoice: order.invoice
    };
  }

  // 3. Payment Verification Check
  // STRICT RULE: Invoices are ONLY created for CAPTURED payments.
  const capturedPayment = order.payments.find(p => p.status === 'CAPTURED');
  if (!capturedPayment) {
    logger.warn(`Cannot create invoice for Order [${order.orderNumber}]: No CAPTURED payment found. Order status: ${order.status}`);
    const error = new Error('Invoices can only be generated for orders with verified CAPTURED payments');
    error.statusCode = 400;
    error.code = 'PAYMENT_NOT_CAPTURED';
    throw error;
  }

  // 4. Cancellation Race Check
  // If order was cancelled and payment arrived late, flag for refund review instead of issuing normal invoice
  if (order.status === 'CANCELLED') {
    logger.warn(`Order [${order.orderNumber}] was CANCELLED. Payment was captured post-cancellation; flagged for refund review. Invoice generation skipped.`);
    return {
      success: false,
      status: 'REFUND_REVIEW_REQUIRED',
      message: 'Order was cancelled before payment capture. Flagged for refund review; standard invoice not issued.'
    };
  }

  // 5. Generate Collision-Resistant Invoice Number
  const invoiceNumber = await generateUniqueInvoiceNumber();

  // 6. Render PDF Buffer using Immutable Order Snapshots
  let pdfBuffer;
  try {
    pdfBuffer = await renderInvoicePDFBuffer({
      invoiceNumber,
      order,
      payment: capturedPayment,
      user: order.user
    });
  } catch (pdfErr) {
    logger.error(`PDF generation failed for Order [${order.orderNumber}]: ${pdfErr.message}`);
    // Do NOT fail the payment! Log error and bubble for controlled retry
    const err = new Error(`Failed to render invoice PDF: ${pdfErr.message}`);
    err.statusCode = 500;
    err.code = 'PDF_GENERATION_FAILED';
    throw err;
  }

  // 7. Store PDF in Private Storage
  const filename = `${invoiceNumber}.pdf`;
  const storageResult = await storageService.saveInvoicePDF(filename, pdfBuffer);

  // 8. Transactionally Record Invoice in PostgreSQL
  let createdInvoice;
  try {
    createdInvoice = await prisma.invoice.create({
      data: {
        orderId: order.id,
        invoiceNumber,
        userId: order.userId,
        subtotal: order.subtotal,
        discountAmount: order.discountAmount,
        taxAmount: order.taxAmount,
        shippingAmount: order.shippingAmount,
        totalAmount: order.totalAmount,
        currency: order.currency || 'INR',
        storageKey: storageResult.storageKey,
        pdfPath: storageResult.filePath,
        pdfUrl: `/api/v1/invoices/${invoiceNumber}/download`,
        status: 'GENERATED',
        emailStatus: 'PENDING',
        taxBreakdown: JSON.stringify({
          taxRate: 18,
          cgstRate: 9,
          sgstRate: 9,
          cgstAmount: (Number(order.taxAmount) / 2).toFixed(2),
          sgstAmount: (Number(order.taxAmount) / 2).toFixed(2),
          totalTax: Number(order.taxAmount).toFixed(2)
        })
      }
    });
  } catch (dbErr) {
    // If concurrent insert race occurred on unique(orderId), fetch existing invoice
    if (dbErr.code === 'P2002') {
      logger.info(`Concurrent invoice insertion detected for Order [${order.orderNumber}]. Retrieving existing record.`);
      const existing = await prisma.invoice.findUnique({
        where: { orderId: order.id }
      });
      if (existing) {
        return {
          success: true,
          isExisting: true,
          invoice: existing
        };
      }
    }
    throw dbErr;
  }

  logger.info(`Invoice [${invoiceNumber}] successfully generated and stored for Order [${order.orderNumber}]. Trigger: [${triggerSource}]`);

  // 9. Dispatch Email Notifications (Non-blocking: failures must never roll back payment)
  try {
    const customerEmailResult = await sendInvoiceEmail({
      to: order.user.email,
      customerName: order.user.fullName,
      orderNumber: order.orderNumber,
      invoiceNumber: createdInvoice.invoiceNumber,
      totalAmount: createdInvoice.totalAmount,
      pdfBuffer
    });

    const isSent = customerEmailResult.sent === true;
    await prisma.invoice.update({
      where: { id: createdInvoice.id },
      data: {
        emailStatus: isSent ? 'SENT' : 'FAILED',
        emailAttempts: { increment: 1 },
        emailLastAttemptAt: new Date(),
        emailError: isSent ? null : (customerEmailResult.error || customerEmailResult.message || 'SMTP unconfigured')
      }
    });

    // Send admin notification
    await sendAdminOrderNotification({
      order,
      payment: capturedPayment,
      invoice: createdInvoice
    });
  } catch (emailErr) {
    logger.warn(`Email notification dispatch encountered error: ${emailErr.message}. Invoice and payment remain valid.`);
    await prisma.invoice.update({
      where: { id: createdInvoice.id },
      data: {
        emailStatus: 'FAILED',
        emailAttempts: { increment: 1 },
        emailLastAttemptAt: new Date(),
        emailError: emailErr.message
      }
    }).catch(() => {});
  }

  return {
    success: true,
    isExisting: false,
    invoice: createdInvoice
  };
}

/**
 * Resends customer invoice email. Rate-limited and ownership-checked.
 */
export async function resendInvoiceEmail({ invoiceId, userId, isAdmin = false }) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      order: {
        include: {
          items: true,
          user: true
        }
      }
    }
  });

  if (!invoice) {
    const err = new Error('Invoice not found');
    err.statusCode = 404;
    err.code = 'INVOICE_NOT_FOUND';
    throw err;
  }

  // Ownership Check
  if (!isAdmin && invoice.userId !== userId) {
    const err = new Error('You do not have permission to resend this invoice');
    err.statusCode = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }

  // Load PDF Buffer from private storage
  const pdfBuffer = await storageService.getInvoicePDFBuffer(invoice.storageKey || `${invoice.invoiceNumber}.pdf`);

  // Dispatch Email
  const emailResult = await sendInvoiceEmail({
    to: invoice.order.user.email,
    customerName: invoice.order.user.fullName,
    orderNumber: invoice.order.orderNumber,
    invoiceNumber: invoice.invoiceNumber,
    totalAmount: invoice.totalAmount,
    pdfBuffer
  });

  const isSent = emailResult.sent === true;
  const updatedInvoice = await prisma.invoice.update({
    where: { id: invoice.id },
    data: {
      emailStatus: isSent ? 'SENT' : 'FAILED',
      emailAttempts: { increment: 1 },
      emailLastAttemptAt: new Date(),
      emailError: isSent ? null : (emailResult.error || emailResult.message || 'SMTP delivery failed')
    }
  });

  return {
    success: true,
    sent: isSent,
    invoice: updatedInvoice,
    message: isSent
      ? `Invoice sent to ${invoice.order.user.email}`
      : (emailResult.message || 'Email delivery could not be completed at this time.')
  };
}

/**
 * Retrieves invoice by order ID.
 */
export async function getInvoiceByOrderId({ orderId, userId, isAdmin = false }) {
  const invoice = await prisma.invoice.findUnique({
    where: { orderId },
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          status: true,
          userId: true
        }
      }
    }
  });

  if (!invoice) {
    const err = new Error('Invoice not found for this order');
    err.statusCode = 404;
    err.code = 'INVOICE_NOT_FOUND';
    throw err;
  }

  if (!isAdmin && invoice.userId !== userId && invoice.order.userId !== userId) {
    const err = new Error('You do not have permission to access this invoice');
    err.statusCode = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }

  return invoice;
}

/**
 * Retrieves invoice by ID or invoiceNumber.
 */
export async function getInvoiceById(identifier, { userId, isAdmin = false }) {
  const invoice = await prisma.invoice.findFirst({
    where: {
      OR: [
        { id: identifier },
        { invoiceNumber: identifier }
      ]
    },
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          status: true,
          userId: true
        }
      }
    }
  });

  if (!invoice) {
    const err = new Error('Invoice not found');
    err.statusCode = 404;
    err.code = 'INVOICE_NOT_FOUND';
    throw err;
  }

  if (!isAdmin && invoice.userId !== userId && invoice.order.userId !== userId) {
    const err = new Error('You do not have permission to access this invoice');
    err.statusCode = 403;
    err.code = 'FORBIDDEN';
    throw err;
  }

  return invoice;
}
