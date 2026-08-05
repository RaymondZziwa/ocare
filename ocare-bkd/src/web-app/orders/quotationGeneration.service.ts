// src/receipt/quotation.service.ts
import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import * as path from 'path';

@Injectable()
export class QuotationService {
  private readonly LOGO_PATH = path.join(__dirname, 'assets', 'logo.jpg');
  private readonly BUSINESS_NAME = 'Ocare Pharmacy';
  private readonly ADDRESS = 'Kisasi Bahai Road, Kampala, Uganda';
  private readonly PHONE = '+256 200 947 066';
  private readonly EMAIL = 'info@ocareug.com';
  private readonly WEBSITE = 'www.ocareug.com';
  private readonly THEME_COLOR = '#1ca24e';

  async generateQuotationBuffer(draft: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const PAGE_WIDTH = 595.28;
        const PAGE_HEIGHT = 841.89;
        const MARGIN = 50;
        const MAX_Y = PAGE_HEIGHT - MARGIN - 30;
        const ROW_HEIGHT = 20;

        const doc = new PDFDocument({
          size: [PAGE_WIDTH, PAGE_HEIGHT],
          margin: MARGIN,
          info: {
            Title: 'Quotation',
            Author: this.BUSINESS_NAME,
          },
        });

        const buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          resolve(Buffer.concat(buffers));
        });

        const drawLine = (y: number, color: string = '#cccccc') => {
          doc
            .strokeColor(color)
            .lineWidth(0.5)
            .moveTo(MARGIN, y)
            .lineTo(PAGE_WIDTH - MARGIN, y)
            .stroke();
        };

        const drawThickLine = (y: number, color: string = this.THEME_COLOR) => {
          doc
            .strokeColor(color)
            .lineWidth(2)
            .moveTo(MARGIN, y)
            .lineTo(PAGE_WIDTH - MARGIN, y)
            .stroke();
        };

        const formatCurrency = (amount: number): string => {
          return new Intl.NumberFormat('en-UG').format(amount);
        };

        const drawPageHeader = (isFirstPage: boolean, quotationNumber: string): number => {
          let y = MARGIN;

          if (isFirstPage) {
            // Green header bar
            doc
              .fillColor(this.THEME_COLOR)
              .rect(MARGIN - 10, y - 10, PAGE_WIDTH - (MARGIN - 10) * 2, 50)
              .fill();
            
            y += 15;

            // Business name in white
            doc.fillColor('white').font('Helvetica-Bold').fontSize(16);
            doc.text(this.BUSINESS_NAME, MARGIN, y, {
              align: 'center',
            });
            
            y += 20;

            // Contact info in white
            doc.fillColor('white').font('Helvetica').fontSize(8);
            doc.text(`${this.ADDRESS} | ${this.PHONE} | ${this.EMAIL}`, MARGIN, y, {
              align: 'center',
            });

            y += 25;

            // Quotation title with theme color
            doc.fillColor(this.THEME_COLOR).font('Helvetica-Bold').fontSize(22);
            doc.text('QUOTATION', MARGIN, y, {
              align: 'center',
            });

            y += 30;

            // Quotation details box
            const boxY = y;
            const boxHeight = 70;
            
            doc
              .strokeColor(this.THEME_COLOR)
              .lineWidth(1)
              .rect(MARGIN, boxY, PAGE_WIDTH - MARGIN * 2, boxHeight)
              .stroke();

            y += 15;

            const issueDate = new Date().toLocaleDateString('en-UG', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });
            const validUntil = new Date(
              Date.now() + 14 * 24 * 60 * 60 * 1000,
            ).toLocaleDateString('en-UG', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            doc.fillColor('black').font('Helvetica-Bold').fontSize(10);
            doc.text('Quotation Number:', MARGIN + 15, y);
            doc.fillColor(this.THEME_COLOR).font('Helvetica').fontSize(10);
            doc.text(quotationNumber, MARGIN + 130, y);

            y += 18;

            doc.fillColor('black').font('Helvetica-Bold').fontSize(10);
            doc.text('Issue Date:', MARGIN + 15, y);
            doc.fillColor('black').font('Helvetica').fontSize(10);
            doc.text(issueDate, MARGIN + 130, y);

            y += 18;

            doc.fillColor('black').font('Helvetica-Bold').fontSize(10);
            doc.text('Valid Until:', MARGIN + 15, y);
            doc.fillColor(this.THEME_COLOR).font('Helvetica').fontSize(10);
            doc.text(validUntil, MARGIN + 130, y);

            y = boxY + boxHeight + 20;
          } else {
            // Continuation header
            doc.fillColor(this.THEME_COLOR).font('Helvetica-Bold').fontSize(14);
            doc.text('QUOTATION (Continued)', MARGIN, y, {
              align: 'center',
            });
            y += 20;
            doc.fillColor('black').font('Helvetica').fontSize(9);
            doc.text(`Quotation #: ${quotationNumber}`, MARGIN, y, {
              align: 'center',
            });
            y += 15;
          }

          // Table header with theme color background
          const tableHeaderHeight = 25;
          doc
            .fillColor(this.THEME_COLOR)
            .rect(MARGIN, y, PAGE_WIDTH - MARGIN * 2, tableHeaderHeight)
            .fill();

          y += 8;

          const colWidths = [35, 200, 50, 90, 90];
          const startX = MARGIN;
          const xPositions: number[] = [];
          let xAcc = startX;
          colWidths.forEach((w) => {
            xPositions.push(xAcc);
            xAcc += w;
          });

          doc.fillColor('white').font('Helvetica-Bold').fontSize(9);
          doc.text('#', xPositions[0], y, {
            width: colWidths[0],
            align: 'center',
          });
          doc.text('Description', xPositions[1], y, {
            width: colWidths[1],
            align: 'left',
          });
          doc.text('Qty', xPositions[2], y, {
            width: colWidths[2],
            align: 'center',
          });
          doc.text('Unit Price', xPositions[3], y, {
            width: colWidths[3],
            align: 'right',
          });
          doc.text('Total', xPositions[4], y, {
            width: colWidths[4],
            align: 'right',
          });

          y = y + tableHeaderHeight - 8 + 10;

          return y;
        };

        const quotationNumber = `Q-${Date.now().toString().slice(-8)}-${draft.id.slice(-4)}`;
        let currentY = drawPageHeader(true, quotationNumber);
        
        const items = draft.cart || [];
        let subtotal = 0;

        const colWidths = [35, 200, 50, 90, 90];
        const startX = MARGIN;
        const xPositions: number[] = [];
        let xAcc = startX;
        colWidths.forEach((w) => {
          xPositions.push(xAcc);
          xAcc += w;
        });

        doc.fillColor('black').font('Helvetica').fontSize(9);

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const qty = item.quantity || 1;
          const unitPrice = Number(item.sellingPrice) || 0;
          const total = qty * unitPrice;
          subtotal += total;

          const name = item.name || 'Product';

          const neededForRow = ROW_HEIGHT;
          const neededForFooter = 120;
          const neededTotal = neededForRow + neededForFooter;

          if (currentY + neededTotal > MAX_Y) {
            doc.addPage();
            currentY = drawPageHeader(false, quotationNumber);
          }

          const rowY = currentY;
          
          // Alternate row background
          if (i % 2 === 0) {
            doc
              .fillColor('#f5f5f5')
              .rect(MARGIN, rowY - 3, PAGE_WIDTH - MARGIN * 2, ROW_HEIGHT)
              .fill();
          }

          doc.fillColor('black');
          doc.text((i + 1).toString(), xPositions[0], rowY, {
            width: colWidths[0],
            align: 'center',
          });
          doc.text(name, xPositions[1], rowY, {
            width: colWidths[1],
            align: 'left',
          });
          doc.text(qty.toString(), xPositions[2], rowY, {
            width: colWidths[2],
            align: 'center',
          });
          doc.text(formatCurrency(unitPrice), xPositions[3], rowY, {
            width: colWidths[3],
            align: 'right',
          });
          doc.text(formatCurrency(total), xPositions[4], rowY, {
            width: colWidths[4],
            align: 'right',
          });

          currentY += ROW_HEIGHT;
        }

        // Totals section
        const discount = 0;
        const tax = 0;
        const grandTotal = subtotal - discount + tax;

        if (currentY + 120 > MAX_Y) {
          doc.addPage();
          currentY = drawPageHeader(false, quotationNumber);
        }

        // Draw line before totals
        drawThickLine(currentY);
        currentY += 15;

        // Totals box
        // const totalsBoxWidth = 200;
        // const totalsBoxX = PAGE_WIDTH - MARGIN - totalsBoxWidth;
        
        // doc
        //   .strokeColor(this.THEME_COLOR)
        //   .lineWidth(1.5)
        //   .rect(totalsBoxX - 10, currentY - 10, totalsBoxWidth + 20, 100)
        //   .stroke();

        // const labelX = totalsBoxX;
        // const valueX = totalsBoxX + totalsBoxWidth - 10;

        // doc.fillColor('black').font('Helvetica').fontSize(10);
        // doc.text('Subtotal:', labelX, currentY);
        // doc.text(`UGX ${formatCurrency(subtotal)}`, valueX, currentY, {
        //   width: 100,
        //   align: 'right',
        // });
        // currentY += 20;

        // if (discount > 0) {
        //   doc.text('Discount:', labelX, currentY);
        //   doc.text(`- UGX ${formatCurrency(discount)}`, valueX, currentY, {
        //     width: 100,
        //     align: 'right',
        //   });
        //   currentY += 20;
        // }

        // if (tax > 0) {
        //   doc.text('Tax:', labelX, currentY);
        //   doc.text(`UGX ${formatCurrency(tax)}`, valueX, currentY, {
        //     width: 100,
        //     align: 'right',
        //   });
        //   currentY += 20;
        // }

        // Grand total with theme color
        // doc.fillColor(this.THEME_COLOR).font('Helvetica-Bold').fontSize(13);
        // doc.text('GRAND TOTAL:', labelX, currentY);
        // doc.fillColor(this.THEME_COLOR).font('Helvetica-Bold').fontSize(13);
        // doc.text(`UGX ${formatCurrency(grandTotal)}`, valueX, currentY, {
        //   width: 100,
        //   align: 'right',
        // });
        // currentY += 25;

        // drawThickLine(currentY);
        // currentY += 20;

        // Terms and conditions
        doc.fillColor('black').font('Helvetica-Bold').fontSize(10);
        doc.text('Terms & Conditions:', MARGIN, currentY);
        currentY += 12;

        doc.fillColor('black').font('Helvetica').fontSize(8);
        const terms = [
          '• This quotation is valid for 14 days from the date of issue.',
          '• Prices are subject to change without prior notice.',
          '• Please quote the quotation number when placing an order.',
          '• Payment terms: 50% advance, balance upon delivery.',
        ];

        terms.forEach((term) => {
          doc.text(term, MARGIN, currentY);
          currentY += 12;
        });

        currentY += 10;

        // Footer
        drawLine(currentY);
        currentY += 15;

        doc.fillColor(this.THEME_COLOR).font('Helvetica-Bold').fontSize(11);
        doc.text('Thank you for choosing Ocare Pharmacy!', MARGIN, currentY, {
          align: 'center',
        });
        currentY += 12;

        doc.fillColor('black').font('Helvetica').fontSize(9);
        doc.text('For inquiries, contact us at sales@ocareug.com', MARGIN, currentY, {
          align: 'center',
        });
        currentY += 10;

        doc.text(this.WEBSITE, MARGIN, currentY, {
          align: 'center',
        });

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
}
