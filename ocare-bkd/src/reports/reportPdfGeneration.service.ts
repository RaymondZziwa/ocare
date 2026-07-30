// // report-storage.service.ts
// import { Injectable, Logger } from '@nestjs/common';
// import * as fs from 'fs';
// import * as path from 'path';
// import { promisify } from 'util';
// import { createHash } from 'crypto';

// const writeFile = promisify(fs.writeFile);
// const mkdir = promisify(fs.mkdir);
// const readdir = promisify(fs.readdir);
// const stat = promisify(fs.stat);

// export interface StoredReport {
//   id: string;
//   filename: string;
//   path: string;
//   size: number;
//   type: string;
//   store: string;
//   period: string;
//   date: string;
//   createdAt: Date;
//   url: string;
// }

// @Injectable()
// export class ReportStorageService {
//   private readonly logger = new Logger(ReportStorageService.name);
//   private readonly reportsDir = path.join(process.cwd(), 'reports');
//   private readonly baseUrl =
//     process.env.REPORTS_BASE_URL || 'http://localhost:3005/uploads/reports';

//   constructor() {
//     this.ensureReportsDirectory();
//   }

//   private async ensureReportsDirectory() {
//     try {
//       await mkdir(this.reportsDir, { recursive: true });
//       this.logger.log(`Reports directory created at: ${this.reportsDir}`);
//     } catch (error) {
//       this.logger.error('Error creating reports directory:', error);
//     }
//   }

//   async storeReports(reports: any[]): Promise<StoredReport[]> {
//     const storedReports: StoredReport[] = [];

//     for (const report of reports) {
//       try {
//         const storedReport = await this.storeReport(report);
//         storedReports.push(storedReport);
//       } catch (error) {
//         this.logger.error(`Error storing report ${report.filename}:`, error);
//       }
//     }

//     return storedReports;
//   }

//   async storeReport(report: any): Promise<StoredReport> {
//     // Create directory structure: reports/YYYY/MM/DD/
//     const date = new Date();
//     const year = date.getFullYear().toString();
//     const month = (date.getMonth() + 1).toString().padStart(2, '0');
//     const day = date.getDate().toString().padStart(2, '0');

//     const reportDir = path.join(this.reportsDir, year, month, day);
//     await mkdir(reportDir, { recursive: true });

//     // Generate unique filename with timestamp
//     const timestamp = date.getTime();
//     const uniqueId = this.generateReportId(report);
//     const filename = `${timestamp}_${uniqueId}_${report.filename}`;
//     const filePath = path.join(reportDir, filename);

//     // Save the file
//     await writeFile(filePath, report.buffer);

//     // Get file stats
//     const stats = await stat(filePath);

//     const storedReport: StoredReport = {
//       id: uniqueId,
//       filename: report.filename,
//       path: filePath,
//       size: stats.size,
//       type: report.type,
//       store: report.store,
//       period: report.period,
//       date: report.date || date.toISOString().split('T')[0],
//       createdAt: new Date(),
//       url: `${this.baseUrl}/${year}/${month}/${day}/${filename}`,
//     };

//     // Save metadata to database (optional)
//     await this.saveReportMetadata(storedReport);

//     this.logger.log(`Report stored: ${filePath} (${stats.size} bytes)`);

//     return storedReport;
//   }

//   async getReport(reportId: string): Promise<Buffer | null> {
//     try {
//       const metadata = await this.getReportMetadata(reportId);
//       if (!metadata) return null;

//       const fileBuffer = await fs.promises.readFile(metadata.path);
//       return fileBuffer;
//     } catch (error) {
//       this.logger.error(`Error retrieving report ${reportId}:`, error);
//       return null;
//     }
//   }

//   async getReportsByDate(date: Date): Promise<StoredReport[]> {
//     const year = date.getFullYear().toString();
//     const month = (date.getMonth() + 1).toString().padStart(2, '0');
//     const day = date.getDate().toString().padStart(2, '0');

//     const reportDir = path.join(this.reportsDir, year, month, day);

//     try {
//       const files = await readdir(reportDir);
//       const reports: StoredReport[] = [];

//       for (const file of files) {
//         const filePath = path.join(reportDir, file);
//         const stats = await stat(filePath);

//         // Extract metadata from filename
//         const [timestamp, id, ...filenameParts] = file.split('_');
//         const filename = filenameParts.join('_');

//         reports.push({
//           id,
//           filename,
//           path: filePath,
//           size: stats.size,
//           type: 'unknown',
//           store: 'unknown',
//           period: 'unknown',
//           date: date.toISOString().split('T')[0],
//           createdAt: stats.birthtime,
//           url: `${this.baseUrl}/${year}/${month}/${day}/${file}`,
//         });
//       }

//       return reports;
//     } catch (error) {
//       return [];
//     }
//   }

//   async cleanupOldReports(daysToKeep: number = 30): Promise<void> {
//     const cutoffDate = new Date();
//     cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

//     const years = await readdir(this.reportsDir);

//     for (const year of years) {
//       const yearPath = path.join(this.reportsDir, year);
//       const months = await readdir(yearPath);

//       for (const month of months) {
//         const monthPath = path.join(yearPath, month);
//         const days = await readdir(monthPath);

//         for (const day of days) {
//           const dayPath = path.join(monthPath, day);
//           const dayDate = new Date(`${year}-${month}-${day}`);

//           if (dayDate < cutoffDate) {
//             await fs.promises.rm(dayPath, { recursive: true, force: true });
//             this.logger.log(`Cleaned up old reports from: ${dayPath}`);
//           }
//         }
//       }
//     }
//   }

//   private generateReportId(report: any): string {
//     const data = `${report.type}-${report.store}-${report.period}-${Date.now()}`;
//     return createHash('md5').update(data).digest('hex').substring(0, 16);
//   }

//   private async saveReportMetadata(report: StoredReport): Promise<void> {
//     // Save to database - you can create a Report model in Prisma
//     // This is optional - you can also rely on filesystem only
//     try {
//       // Example: await this.prisma.report.create({ data: report });
//       this.logger.debug(`Report metadata saved: ${report.id}`);
//     } catch (error) {
//       this.logger.error('Error saving report metadata:', error);
//     }
//   }

//   private async getReportMetadata(
//     reportId: string,
//   ): Promise<StoredReport | null> {
//     // Retrieve from database if you're storing metadata
//     // Otherwise, search filesystem
//     try {
//       // This is a simplified implementation
//       // You should implement a proper search mechanism
//       const searchPattern = `*_${reportId}_*`;
//       // Use glob or similar to find the file
//       return null;
//     } catch (error) {
//       return null;
//     }
//   }
// }
