// // whatsapp.service.ts
// import { Injectable, Logger } from '@nestjs/common';
// import * as Twilio from 'twilio';
// import * as fs from 'fs';

// @Injectable()
// export class WhatsAppService {
//   private readonly logger = new Logger(WhatsAppService.name);
//   private client: Twilio.Twilio;
//   private readonly fromWhatsApp: string;
//   private readonly adminWhatsApp: string;

//   constructor() {
//     this.client = new Twilio.Twilio(
//       process.env.TWILIO_ACCOUNT_SID,
//       process.env.TWILIO_AUTH_TOKEN,
//     );
//     this.fromWhatsApp = process.env.TWILIO_PHONE_NUMBER;
//     this.adminWhatsApp = process.env.PROF_ADMIN_NUMBER;
//   }

//   async sendReportsToAdmin(reports: StoredReport[]): Promise<void> {
//     if (!reports || reports.length === 0) {
//       this.logger.warn('No reports to send');
//       return;
//     }

//     try {
//       // Send summary message first
//       const summary = this.buildReportSummary(reports);
//       await this.sendWhatsAppMessage(summary);

//       // Send each report as a document
//       for (const report of reports) {
//         await this.sendReportDocument(report);
//         // Add delay to avoid rate limiting
//         await this.delay(2000);
//       }

//       // Send completion message
//       await this.sendWhatsAppMessage(
//         `✅ *Reports Generation Complete*\n\n` +
//           `Total Reports: ${reports.length}\n` +
//           `Total Size: ${this.formatBytes(reports.reduce((sum, r) => sum + r.size, 0))}\n` +
//           `Generated: ${new Date().toLocaleString()}\n\n` +
//           `*Report Summary:*\n${this.getReportTypeSummary(reports)}`,
//       );

//       this.logger.log(`Successfully sent ${reports.length} reports to admin`);
//     } catch (error) {
//       this.logger.error('Error sending reports to admin:', error);
//       throw error;
//     }
//   }

//   async sendSingleReportToAdmin(report: StoredReport): Promise<void> {
//     try {
//       await this.sendWhatsAppMessage(
//         `📊 *Report Generated*\n\n` +
//           `Type: ${this.formatReportType(report.type)}\n` +
//           `Store: ${report.store}\n` +
//           `Period: ${report.period}\n` +
//           `Date: ${report.date}\n` +
//           `Size: ${this.formatBytes(report.size)}`,
//       );

//       await this.sendReportDocument(report);
//       this.logger.log(`Sent single report to admin: ${report.filename}`);
//     } catch (error) {
//       this.logger.error('Error sending single report:', error);
//       throw error;
//     }
//   }

//   async sendCustomReport(
//     buffer: Buffer,
//     filename: string,
//     description: string,
//   ): Promise<void> {
//     try {
//       await this.sendWhatsAppMessage(description);
//       await this.sendDocument(buffer, filename);
//       this.logger.log(`Sent custom report: ${filename}`);
//     } catch (error) {
//       this.logger.error('Error sending custom report:', error);
//       throw error;
//     }
//   }

//   private async sendReportDocument(report: StoredReport): Promise<void> {
//     try {
//       const fileBuffer = fs.readFileSync(report.path);
//       await this.sendDocument(fileBuffer, report.filename, report.type);
//     } catch (error) {
//       this.logger.error(
//         `Error sending report document ${report.filename}:`,
//         error,
//       );
//       throw error;
//     }
//   }

//   private async sendDocument(
//     buffer: Buffer,
//     filename: string,
//     reportType?: string,
//   ): Promise<void> {
//     try {
//       // Upload to a temporary URL or use Twilio's media capabilities
//       // Twilio WhatsApp requires a publicly accessible URL for media
//       // You can either:
//       // 1. Upload to cloud storage (S3, etc.) and provide the URL
//       // 2. Use a temporary file server endpoint

//       // For now, assuming you have a way to serve the file
//       const mediaUrl = `${process.env.API_BASE_URL}/reports/temp/${encodeURIComponent(filename)}`;

//       // Store file temporarily
//       await this.tempStoreFile(buffer, filename);

//       const message = await this.client.messages.create({
//         body: `📄 *${this.formatReportType(reportType)}*\n${filename}`,
//         from: `whatsapp:${this.fromWhatsApp}`,
//         to: `whatsapp:${this.adminWhatsApp}`,
//         mediaUrl: [mediaUrl],
//       });

//       this.logger.log(`Document sent: ${message.sid}`);
//     } catch (error) {
//       this.logger.error('Error sending document:', error);
//       throw error;
//     }
//   }

//   private async sendWhatsAppMessage(body: string): Promise<void> {
//     try {
//       const message = await this.client.messages.create({
//         body,
//         from: `whatsapp:${this.fromWhatsApp}`,
//         to: `whatsapp:${this.adminWhatsApp}`,
//       });

//       this.logger.debug(`WhatsApp message sent: ${message.sid}`);
//     } catch (error) {
//       this.logger.error('Error sending WhatsApp message:', error);
//       throw error;
//     }
//   }

//   private buildReportSummary(reports: StoredReport[]): string {
//     const reportCounts = reports.reduce(
//       (acc, report) => {
//         acc[report.type] = (acc[report.type] || 0) + 1;
//         return acc;
//       },
//       {} as Record<string, number>,
//     );

//     const totalSize = reports.reduce((sum, r) => sum + r.size, 0);

//     return (
//       `📊 *Daily Reports Generated*\n\n` +
//       `*Time:* ${new Date().toLocaleString()}\n` +
//       `*Total Reports:* ${reports.length}\n` +
//       `*Total Size:* ${this.formatBytes(totalSize)}\n\n` +
//       `*Breakdown:*\n${Object.entries(reportCounts)
//         .map(([type, count]) => `• ${this.formatReportType(type)}: ${count}`)
//         .join('\n')}\n\n` +
//       `*Reports are being sent as PDF documents...*`
//     );
//   }

//   private getReportTypeSummary(reports: StoredReport[]): string {
//     const byStore = reports.reduce(
//       (acc, report) => {
//         if (!acc[report.store]) {
//           acc[report.store] = [];
//         }
//         acc[report.store].push(report.type);
//         return acc;
//       },
//       {} as Record<string, string[]>,
//     );

//     return Object.entries(byStore)
//       .map(([store, types]) => `• *${store}*: ${types.length} report(s)`)
//       .join('\n');
//   }

//   private formatReportType(type: string): string {
//     const typeMap: Record<string, string> = {
//       'stock-level': '📦 Stock Level',
//       'stock-movement': '🔄 Stock Movement',
//       'sales-daily': '💰 Daily Sales',
//       'sales-period': '📈 Period Sales',
//       'store-comparison': '🏪 Store Comparison',
//       'massage-services': '💆 Massage Services',
//       'product-performance': '📊 Product Performance',
//       expense: '💸 Expenses',
//       'exhibition-revenue': '🎪 Exhibition Revenue',
//     };

//     return typeMap[type] || type;
//   }

//   private formatBytes(bytes: number): string {
//     if (bytes === 0) return '0 Bytes';
//     const k = 1024;
//     const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
//   }

//   private async tempStoreFile(
//     buffer: Buffer,
//     filename: string,
//   ): Promise<string> {
//     const tempDir = path.join(process.cwd(), 'temp-reports');
//     await fs.promises.mkdir(tempDir, { recursive: true });

//     const filePath = path.join(tempDir, filename);
//     await fs.promises.writeFile(filePath, buffer);

//     // Schedule cleanup after 5 minutes
//     setTimeout(
//       async () => {
//         try {
//           await fs.promises.unlink(filePath);
//         } catch (error) {
//           // Ignore cleanup errors
//         }
//       },
//       5 * 60 * 1000,
//     );

//     return filePath;
//   }

//   private delay(ms: number): Promise<void> {
//     return new Promise((resolve) => setTimeout(resolve, ms));
//   }
// }
