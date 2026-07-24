// // src/receipt/receipt.service.ts
// import { Injectable } from '@nestjs/common';
// import PDFDocument from 'pdfkit';
// import * as fs from 'fs';
// import * as path from 'path';
// import { Response } from 'express';

// @Injectable()
// export class ReceiptService {
//   // Replace with your actual logo path (or base64 string)
//   private readonly LOGO_PATH = path.join(__dirname, 'assets', 'logo.jpg');
//   private readonly BUSINESS_NAME = 'Ocare Pharmacy';
//   private readonly ADDRESS = 'Kisasi Bahai Road, Kampala, Uganda';
//   private readonly PHONE = '+256 200 947 066';
//   private readonly EMAIL = 'info@ocareug.com';
//   private readonly WEBSITE = 'www.ocareug.com';

//   /**
//    * Generates a PDF receipt formatted for 80mm thermal receipt paper.
//    * @param sale - The sale record with items and customer details.
//    * @returns Promise<Buffer> - The PDF buffer.
//    */
//   async generateReceiptBuffer(sale: any): Promise<Buffer> {
//     return new Promise((resolve, reject) => {
//       try {
//         // 80mm receipt paper width ≈ 226 points (72dpi), with small margins
//         const PAGE_WIDTH = 250; // points (approx 88mm)
//         const MARGIN = 10;

//         const doc = new PDFDocument({
//           size: [PAGE_WIDTH, 600], // fixed height will auto-extend, but we can use 'auto'
//           margin: MARGIN,
//           info: {
//             Title: 'Order Receipt',
//             Author: 'Ocare Pharmacy',
//           },
//         });

//         // Use a buffer stream to capture PDF data
//         const buffers: Buffer[] = [];
//         doc.on('data', buffers.push.bind(buffers));
//         doc.on('end', () => {
//           const pdfBuffer = Buffer.concat(buffers);
//           resolve(pdfBuffer);
//         });

//         // ----- Helper to center text -----
//         const centerText = (
//           text: string,
//           y: number,
//           fontSize = 10,
//           font = 'Helvetica',
//         ) => {
//           doc.font(font).fontSize(fontSize);
//           const width = doc.widthOfString(text);
//           const x = (PAGE_WIDTH - width) / 2;
//           doc.text(text, x, y);
//         };

//         let currentY = MARGIN;

//         // ----- Logo (if exists) -----
//         if (fs.existsSync(this.LOGO_PATH)) {
//           try {
//             const logoWidth = 80;
//             const logoHeight = 30;
//             const logoX = (PAGE_WIDTH - logoWidth) / 2;
//             doc.image(this.LOGO_PATH, logoX, currentY, { width: logoWidth });
//             currentY += logoHeight + 5;
//           } catch (error) {
//             console.warn('Logo not loaded, skipping:', error);
//           }
//         }

//         // ----- Business Name (bold) -----
//         centerText(this.BUSINESS_NAME, currentY, 14, 'Helvetica-Bold');
//         currentY += 20;

//         // ----- Address, Phone, Email, Website -----
//         doc.fontSize(9).font('Helvetica');
//         doc.text(this.ADDRESS, { align: 'center' });
//         doc.text(`Tel: ${this.PHONE}`, { align: 'center' });
//         doc.text(`Email: ${this.EMAIL}`, { align: 'center' });
//         doc.text(`Web: ${this.WEBSITE}`, { align: 'center' });
//         currentY = doc.y + 5;

//         // ----- Divider -----
//         doc
//           .moveTo(MARGIN, currentY)
//           .lineTo(PAGE_WIDTH - MARGIN, currentY)
//           .stroke();
//         currentY += 8;

//         // ----- Receipt Title -----
//         centerText('RECEIPT', currentY, 12, 'Helvetica-Bold');
//         currentY += 18;

//         // ----- Order Details -----
//         const orderDate = sale.createdAt
//           ? new Date(sale.createdAt).toLocaleDateString('en-UG', {
//               year: 'numeric',
//               month: 'short',
//               day: 'numeric',
//             })
//           : 'N/A';
//         const customerName = `${sale.client?.firstName} ${sale.client?.lastName }`|| 'Guest';
//         // const paymentMethod = sale.paymentMethod || 'Online';

//         doc.fontSize(9).font('Helvetica');
//         doc.text(`Date: ${orderDate}`, { align: 'left' });
//         doc.text(`Customer: ${customerName}`, { align: 'left' });
//         // doc.text(`Payment: ${paymentMethod}`, { align: 'left' });
//         currentY = doc.y + 6;

//         // ----- Divider -----
//         doc
//           .moveTo(MARGIN, currentY)
//           .lineTo(PAGE_WIDTH - MARGIN, currentY)
//           .stroke();
//         currentY += 8;

//         // ----- Items Header -----
//         doc.font('Helvetica-Bold').fontSize(9);
//         doc.text('Qty', { continued: true, width: 35, align: 'center' });
//         doc.text('Item', { continued: true, width: 110, align: 'left' });
//         doc.text('Total', { align: 'right' });
//         currentY = doc.y;
//         doc
//           .moveTo(MARGIN, currentY)
//           .lineTo(PAGE_WIDTH - MARGIN, currentY)
//           .stroke();
//         currentY += 4;

//         // ----- Items Rows -----
//         const items = sale.items || [];
//         let subtotal = 0;

//         doc.font('Helvetica').fontSize(9);
//         items.forEach((item: any) => {
//           const qty = item.quantity || 1;
//           const price = parseFloat(item.unitPrice || item.price || 0);
//           const total = qty * price;
//           subtotal += total;

//           const name = (item.product?.name || item.name || 'Product').substring(
//             0,
//             25,
//           ); // truncate if long

//           doc.text(qty.toString(), {
//             continued: true,
//             width: 35,
//             align: 'center',
//           });
//           doc.text(name, { continued: true, width: 110, align: 'left' });
//           doc.text(total.toFixed(2), { align: 'right' });
//           currentY = doc.y;
//         });

//         // ----- Divider -----
//         doc
//           .moveTo(MARGIN, currentY)
//           .lineTo(PAGE_WIDTH - MARGIN, currentY)
//           .stroke();
//         currentY += 4;

//         // ----- Totals -----
//         doc.font('Helvetica-Bold').fontSize(10);
//         doc.text(`Subtotal: UGX ${subtotal.toFixed(2)}`, { align: 'right' });
//         // Add tax if needed
//         // doc.text(`Tax (0%): UGX 0.00`, { align: 'right' });
//         doc.text(`Total: UGX ${(sale.total || subtotal).toFixed(2)}`, {
//           align: 'right',
//         });
//         currentY = doc.y + 6;

//         // ----- Divider -----
//         doc
//           .moveTo(MARGIN, currentY)
//           .lineTo(PAGE_WIDTH - MARGIN, currentY)
//           .stroke();
//         currentY += 8;

//         // ----- Thank You Message -----
//         doc.font('Helvetica').fontSize(9);
//         doc.text('Thank you for choosing Ocare Pharmacy!', { align: 'center' });
//         doc.text('We value your health.', { align: 'center' });
//         currentY = doc.y + 6;

//         // ----- Footer (return policy, etc.) -----
//         doc.fontSize(8);
//         // doc.text('Items returned within 7 days with receipt.', {
//         //   align: 'center',
//         // });
//         doc.text('For inquiries, contact us at support@ocareug.com', {
//           align: 'center',
//         });

//         // Finalize the PDF
//         doc.end();
//       } catch (error) {
//         reject(error);
//       }
//     });
//   }
// }
