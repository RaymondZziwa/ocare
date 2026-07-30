// src/receipt/receipt.service.ts
import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ReceiptService {
  private readonly LOGO_PATH = path.join(__dirname, 'assets', 'logo.jpg');
  private readonly BUSINESS_NAME = 'Ocare Pharmacy';
  private readonly ADDRESS = 'Kisasi Bahai Road, Kampala, Uganda';
  private readonly PHONE = '+256 200 947 066';
  private readonly EMAIL = 'info@ocareug.com';
  private readonly WEBSITE = 'www.ocareug.com';

  /**
   * Generates a professional A4 receipt with automatic pagination.
   */
  async generateReceiptBuffer(sale: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        // A4 dimensions in points
        const PAGE_WIDTH = 595.28;
        const PAGE_HEIGHT = 841.89;
        const MARGIN = 50;
        const MAX_Y = PAGE_HEIGHT - MARGIN;
        const ROW_HEIGHT = 16;

        const doc = new PDFDocument({
          size: [PAGE_WIDTH, PAGE_HEIGHT],
          margin: MARGIN,
          info: {
            Title: 'Sales Receipt',
            Author: this.BUSINESS_NAME,
          },
        });

        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          resolve(Buffer.concat(buffers));
        });

        const drawLine = (y: number) => {
          doc.moveTo(MARGIN, y).lineTo(PAGE_WIDTH - MARGIN, y).stroke();
        };

        const drawPageHeader = (isFirstPage: boolean): number => {
          let y = MARGIN;

          if (isFirstPage) {
            // Logo and Business Info
            if (fs.existsSync(this.LOGO_PATH)) {
              try {
                const logoWidth = 80;
                const logoHeight = 40;
                doc.image(this.LOGO_PATH, MARGIN, y, { width: logoWidth, height: logoHeight });
                const infoX = MARGIN + logoWidth + 20;
                doc.font('Helvetica-Bold').fontSize(18);
                doc.text(this.BUSINESS_NAME, infoX, y + 5, {
                  width: PAGE_WIDTH - infoX - MARGIN,
                  align: 'left' as const,
                });
                doc.font('Helvetica').fontSize(10);
                doc.text(this.ADDRESS, infoX, y + 30, {
                  width: PAGE_WIDTH - infoX - MARGIN,
                  align: 'left' as const,
                });
                doc.text(`Tel: ${this.PHONE}  |  Email: ${this.EMAIL}`, infoX, y + 45, {
                  width: PAGE_WIDTH - infoX - MARGIN,
                  align: 'left' as const,
                });
                y += Math.max(logoHeight, 60) + 10;
              } catch {
                // Fallback centered
                doc.font('Helvetica-Bold').fontSize(20);
                doc.text(this.BUSINESS_NAME, { align: 'center' as const });
                doc.font('Helvetica').fontSize(10);
                doc.text(this.ADDRESS, { align: 'center' as const });
                doc.text(`Tel: ${this.PHONE}  |  Email: ${this.EMAIL}`, { align: 'center' as const });
                y = doc.y + 10;
              }
            } else {
              doc.font('Helvetica-Bold').fontSize(20);
              doc.text(this.BUSINESS_NAME, { align: 'center' as const });
              doc.font('Helvetica').fontSize(10);
              doc.text(this.ADDRESS, { align: 'center' as const });
              doc.text(`Tel: ${this.PHONE}  |  Email: ${this.EMAIL}`, { align: 'center' as const });
              y = doc.y + 10;
            }

            drawLine(y);
            y += 12;

            doc.font('Helvetica-Bold').fontSize(16);
            doc.text('SALES RECEIPT', { align: 'center' as const });
            y = doc.y + 8;

            const orderDate = sale.createdAt
              ? new Date(sale.createdAt).toLocaleDateString('en-UG', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : 'N/A';
            const orderTime = sale.createdAt
              ? new Date(sale.createdAt).toLocaleTimeString('en-UG', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'N/A';
            const customerName =
              sale.client?.firstName && sale.client?.lastName
                ? `${sale.client.firstName} ${sale.client.lastName}`
                : sale.client?.name || 'Guest';
            const customerEmail = sale.client?.email || '—';
            const customerPhone = sale.client?.phone || '—';

            doc.font('Helvetica').fontSize(10);
            const col1X = MARGIN;
            const col2X = PAGE_WIDTH / 2;
            const lineHeight = 16;
            let metaY = y;

            // Explicitly type options with 'as const'
            const labelStyle = { continued: true, width: 100, align: 'left' as const };
            const valueStyle = { align: 'left' as const };

            doc.font('Helvetica-Bold');
            doc.text('Receipt #:', col1X, metaY, labelStyle);
            doc.font('Helvetica');
            doc.text(sale.id || 'N/A', col2X, metaY, valueStyle);
            metaY += lineHeight;

            doc.font('Helvetica-Bold');
            doc.text('Date:', col1X, metaY, labelStyle);
            doc.font('Helvetica');
            doc.text(`${orderDate} ${orderTime}`, col2X, metaY, valueStyle);
            metaY += lineHeight;

            doc.font('Helvetica-Bold');
            doc.text('Customer:', col1X, metaY, labelStyle);
            doc.font('Helvetica');
            doc.text(customerName, col2X, metaY, valueStyle);
            metaY += lineHeight;

            doc.font('Helvetica-Bold');
            doc.text('Email:', col1X, metaY, labelStyle);
            doc.font('Helvetica');
            doc.text(customerEmail, col2X, metaY, valueStyle);
            metaY += lineHeight;

            doc.font('Helvetica-Bold');
            doc.text('Phone:', col1X, metaY, labelStyle);
            doc.font('Helvetica');
            doc.text(customerPhone, col2X, metaY, valueStyle);
            metaY += lineHeight;

            const paymentMethod = sale.paymentMethod || 'N/A';
            doc.font('Helvetica-Bold');
            doc.text('Payment:', col1X, metaY, labelStyle);
            doc.font('Helvetica');
            doc.text(paymentMethod, col2X, metaY, valueStyle);
            metaY += lineHeight;

            if (sale.status) {
              doc.font('Helvetica-Bold');
              doc.text('Status:', col1X, metaY, labelStyle);
              doc.font('Helvetica');
              doc.text(sale.status, col2X, metaY, valueStyle);
              metaY += lineHeight;
            }

            y = metaY + 6;
            drawLine(y);
            y += 10;
          } else {
            doc.font('Helvetica-Bold').fontSize(14);
            doc.text('RECEIPT (Continued)', { align: 'center' as const });
            y = doc.y + 8;
            doc.font('Helvetica').fontSize(9);
            doc.text(`Receipt #: ${sale.id || 'N/A'}`, { align: 'center' as const });
            y = doc.y + 6;
            drawLine(y);
            y += 8;
          }

          // Table headers (on every page)
          const colWidths = [30, 180, 40, 80, 80];
          const startX = MARGIN;
          const xPositions: number[] = [];
          let xAcc = startX;
          colWidths.forEach((w) => {
            xPositions.push(xAcc);
            xAcc += w;
          });

          doc.font('Helvetica-Bold').fontSize(10);
          doc.text('Item #', xPositions[0], y, { width: colWidths[0], align: 'center' as const });
          doc.text('Description', xPositions[1], y, { width: colWidths[1], align: 'left' as const });
          doc.text('Qty', xPositions[2], y, { width: colWidths[2], align: 'center' as const });
          doc.text('Unit Price', xPositions[3], y, { width: colWidths[3], align: 'right' as const });
          doc.text('Total', xPositions[4], y, { width: colWidths[4], align: 'right' as const });
          y += 18;

          drawLine(y);
          y += 6;

          return y;
        };

        // Main generation
        let currentY = drawPageHeader(true);
        const items = sale.items || [];
        let subtotal = 0;

        const colWidths = [30, 180, 40, 80, 80];
        const startX = MARGIN;
        const xPositions: number[] = [];
        let xAcc = startX;
        colWidths.forEach((w) => {
          xPositions.push(xAcc);
          xAcc += w;
        });

        doc.font('Helvetica').fontSize(9);

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const qty = item.quantity || 1;
          const unitPrice = parseFloat(item.unitPrice || item.price || 0);
          const total = qty * unitPrice;
          subtotal += total;

          const name = (item.product?.name || item.name || 'Product').substring(0, 30);

          const neededForRow = ROW_HEIGHT;
          const neededForFooter = 80;
          const neededTotal = neededForRow + neededForFooter;

          if (currentY + neededTotal > MAX_Y) {
            doc.addPage();
            currentY = drawPageHeader(false);
          }

          const rowY = currentY;
          doc.text((i + 1).toString(), xPositions[0], rowY, { width: colWidths[0], align: 'center' as const });
          doc.text(name, xPositions[1], rowY, { width: colWidths[1], align: 'left' as const });
          doc.text(qty.toString(), xPositions[2], rowY, { width: colWidths[2], align: 'center' as const });
          doc.text(unitPrice.toFixed(2), xPositions[3], rowY, { width: colWidths[3], align: 'right' as const });
          doc.text(total.toFixed(2), xPositions[4], rowY, { width: colWidths[4], align: 'right' as const });

          currentY += ROW_HEIGHT;
        }

        const totalAmount = sale.total || subtotal;
        const tax = sale.tax || 0;
        const discount = sale.discount || 0;
        const grandTotal = totalAmount + tax - discount;

        if (currentY + 80 > MAX_Y) {
          doc.addPage();
          currentY = drawPageHeader(false);
        }

        drawLine(currentY);
        currentY += 8;

        const totalsX = PAGE_WIDTH - MARGIN - 150;
        doc.font('Helvetica').fontSize(10);
        doc.text(`Subtotal:`, totalsX, currentY, { width: 100, align: 'right' as const });
        doc.text(`UGX ${subtotal.toFixed(2)}`, totalsX + 100, currentY, { width: 50, align: 'right' as const });
        currentY += 16;

        if (discount > 0) {
          doc.text(`Discount:`, totalsX, currentY, { width: 100, align: 'right' as const });
          doc.text(`- UGX ${discount.toFixed(2)}`, totalsX + 100, currentY, { width: 50, align: 'right' as const });
          currentY += 16;
        }
        if (tax > 0) {
          doc.text(`Tax (${sale.taxRate || 0}%):`, totalsX, currentY, { width: 100, align: 'right' as const });
          doc.text(`UGX ${tax.toFixed(2)}`, totalsX + 100, currentY, { width: 50, align: 'right' as const });
          currentY += 16;
        }

        doc.font('Helvetica-Bold').fontSize(12);
        doc.text(`TOTAL:`, totalsX, currentY, { width: 100, align: 'right' as const });
        doc.text(`UGX ${grandTotal.toFixed(2)}`, totalsX + 100, currentY, { width: 50, align: 'right' as const });
        currentY += 24;

        drawLine(currentY);
        currentY += 12;

        doc.font('Helvetica').fontSize(9);
        doc.text('Thank you for choosing Ocare Pharmacy!', { align: 'center' as const });
        doc.text('We value your health and trust.', { align: 'center' as const });
        currentY = doc.y + 8;

        doc.fontSize(8);
        doc.text('For inquiries, contact us at support@ocareug.com', { align: 'center' as const });
        doc.text('Items returned within 7 days with original receipt.', { align: 'center' as const });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}