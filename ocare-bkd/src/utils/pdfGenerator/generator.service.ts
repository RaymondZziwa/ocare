import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';

export interface ReportConfig {
  title: string;
  subtitle?: string;
  filters?: Record<string, any>;
  summary?: any;
  sections: ReportSection[];
  companyInfo: CompanyInfo;
}

export interface ReportSection {
  title: string;
  type: 'table' | 'summary' | 'chart' | 'text';
  data: any;
  columns?: ColumnConfig[];
  summaryCards?: SummaryCard[];
}

export interface ColumnConfig {
  header: string;
  key: string;
  width: number;
  align?: 'left' | 'center' | 'right';
  format?: (value: any, row?: any) => string;
}

export interface SummaryCard {
  title: string;
  value: string | number;
  subtitle?: string;
  color?: [number, number, number]; // RGB
}

export interface CompanyInfo {
  id: string;
  name: string;
  email: string;
  tel1: string;
  tel2?: string | null;
  address: string;
  logo?: string | null;
  website: string | null;
  tinNumber: string | null;
  description?: string | null;
}

@Injectable()
export class PdfService {
  private readonly PAGE_HEIGHT = 750;
  private readonly PAGE_WIDTH = 500;
  private readonly MARGIN = 50;

  async generateReportPDF(config: ReportConfig): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        // Validate config
        if (!config.title || !config.companyInfo || !config.sections) {
          throw new Error(
            'Invalid report configuration: missing required fields',
          );
        }

        const doc = new PDFDocument({
          margin: this.MARGIN,
          size: 'A4',
        });
        const buffers: Buffer[] = [];

        doc.on('data', (buffer: Buffer) => buffers.push(buffer));
        doc.on('end', () => resolve(Buffer.concat(buffers)));
        doc.on('error', (error: Error) => reject(error));

        // Add header with company info
        this.addHeader(doc, config.companyInfo);

        // Add report title and subtitle
        this.addReportTitle(doc, config.title, config.subtitle, config.filters);

        // Add summary section if provided
        if (config.summary) {
          this.addSummarySection(doc, config.summary);
        }

        // Process all sections
        config.sections.forEach((section) => {
          this.addSection(doc, section);
        });

        // Add footer
        this.addFooter(doc, config.companyInfo);

        doc.end();
      } catch (error) {
        reject(
          error instanceof Error ? error : new Error('Unknown error occurred'),
        );
      }
    });
  }

  private addHeader(doc: PDFKit.PDFDocument, companyInfo: CompanyInfo): void {
    // Company name and logo area
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text(companyInfo.name, this.MARGIN, 50);

    // Contact information on the right
    const contactInfo = [
      `Website: ${companyInfo.website}`,
      `Email: ${companyInfo.email}`,
      `Phone: ${companyInfo.tel1}${companyInfo.tel2 ? `, ${companyInfo.tel2}` : ''}`,
      `Address: ${companyInfo.address}`,
      `TIN: ${companyInfo.tinNumber}`,
    ];

    let contactY = 50;
    doc.fontSize(9).font('Helvetica');
    contactInfo.forEach((line) => {
      doc.text(line, 400, contactY, { align: 'right', width: 150 });
      contactY += 15;
    });

    // Horizontal line
    doc.moveTo(this.MARGIN, 120).lineTo(550, 120).stroke();
  }

  private addReportTitle(
    doc: PDFKit.PDFDocument,
    title: string,
    subtitle?: string,
    filters?: Record<string, any>,
  ): void {
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text(title, this.MARGIN, 140, { align: 'center' });

    let currentY = 165;

    if (subtitle) {
      doc
        .fontSize(12)
        .font('Helvetica')
        .text(subtitle, this.MARGIN, currentY, { align: 'center' });
      currentY += 20;
    }

    // Add filters if provided
    if (filters && Object.keys(filters).length > 0) {
      doc.fontSize(9).font('Helvetica');
      const filterText = Object.entries(filters)
        .map(([key, value]) => `${key}: ${value}`)
        .join(' | ');

      doc.text(`Filters: ${filterText}`, this.MARGIN, currentY, {
        align: 'center',
      });
      currentY += 15;
    }
  }

  private addSummarySection(doc: PDFKit.PDFDocument, summary: any): void {
    if (doc.y > 600) {
      doc.addPage();
      doc.y = this.MARGIN;
    }

    doc.fontSize(14).font('Helvetica-Bold').text('Summary', this.MARGIN, doc.y);
    doc.moveDown(0.5);

    if (summary.cards && Array.isArray(summary.cards)) {
      this.addSummaryCards(doc, summary.cards);
    }
  }

  private addSummaryCards(doc: PDFKit.PDFDocument, cards: SummaryCard[]): void {
    const cardWidth = 150;
    const cardHeight = 60;
    const gap = 20;
    const startX = this.MARGIN;
    let currentX = startX;
    let currentY = doc.y;

    cards.forEach((card) => {
      // Move to next row if needed
      if (currentX + cardWidth > 550) {
        currentX = startX;
        currentY += cardHeight + gap;

        // Check if we need a new page
        if (currentY + cardHeight > this.PAGE_HEIGHT) {
          doc.addPage();
          currentY = this.MARGIN;
        }
      }

      // Card background
      const color = card.color || [79, 70, 229]; // Default indigo
      doc
        .rect(currentX, currentY, cardWidth, cardHeight)
        .fillColor(color as any)
        .fillOpacity(0.1)
        .fill()
        .strokeColor('black')
        .stroke();

      // Card content
      doc.fillColor('black').fillOpacity(1);
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(card.title, currentX + 10, currentY + 10, {
          width: cardWidth - 20,
        });
      doc
        .fontSize(18)
        .font('Helvetica-Bold')
        .text(card.value.toString(), currentX + 10, currentY + 25, {
          width: cardWidth - 20,
        });

      if (card.subtitle) {
        doc
          .fontSize(8)
          .font('Helvetica')
          .text(card.subtitle, currentX + 10, currentY + 45, {
            width: cardWidth - 20,
          });
      }

      currentX += cardWidth + gap;
    });

    doc.y = currentY + cardHeight + 20;
  }

  private addSection(doc: PDFKit.PDFDocument, section: ReportSection): void {
    // Check if we need a new page
    if (doc.y > 650) {
      doc.addPage();
      doc.y = this.MARGIN;
    }

    switch (section.type) {
      case 'table':
        this.addTableSection(doc, section);
        break;
      case 'summary':
        this.addSummarySection(doc, section.data);
        break;
      case 'text':
        this.addTextSection(doc, section);
        break;
      default:
        this.addTableSection(doc, section);
    }
  }

  private addTableSection(
    doc: PDFKit.PDFDocument,
    section: ReportSection,
  ): void {
    if (!section.columns || !Array.isArray(section.data)) {
      return;
    }

    // Validate column widths
    const totalWidth = section.columns.reduce((sum, col) => sum + col.width, 0);
    if (totalWidth > this.PAGE_WIDTH) {
      console.warn(
        `Column widths exceed page width: ${totalWidth} > ${this.PAGE_WIDTH}`,
      );
    }

    // Section header
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text(section.title, this.MARGIN, doc.y);
    doc.moveDown(0.5);

    const headers = section.columns.map((col) => col.header);
    const columnWidths = section.columns.map((col) => col.width);

    let currentY = doc.y;

    // Table headers
    doc
      .rect(this.MARGIN, currentY, this.PAGE_WIDTH, 20)
      .fillColor([79, 70, 229] as any) // Indigo
      .fillOpacity(0.2)
      .fill()
      .strokeColor('black')
      .stroke();

    doc.fillColor('black').fillOpacity(1);
    doc.fontSize(9).font('Helvetica-Bold');

    let x = this.MARGIN + 5;
    headers.forEach((header, index) => {
      const align = section.columns?.[index]?.align || 'left';
      doc.text(header, x, currentY + 5, {
        width: columnWidths[index] - 10,
        align,
      });
      x += columnWidths[index];
    });

    currentY += 25;

    // Table rows
    doc.fontSize(8).font('Helvetica');

    section.data.forEach((row, index) => {
      // Check if we need a new page
      if (currentY > this.PAGE_HEIGHT) {
        doc.addPage();
        currentY = this.MARGIN;

        // Add headers again on new page
        doc
          .rect(this.MARGIN, currentY, this.PAGE_WIDTH, 20)
          .fillColor([79, 70, 229] as any)
          .fillOpacity(0.2)
          .fill()
          .strokeColor('black')
          .stroke();

        doc.fillColor('black').fontSize(9).font('Helvetica-Bold');
        x = this.MARGIN + 5;
        headers.forEach((header, idx) => {
          const align = section.columns?.[idx]?.align || 'left';
          doc.text(header, x, currentY + 5, {
            width: columnWidths[idx] - 10,
            align,
          });
          x += columnWidths[idx];
        });
        currentY += 25;
        doc.fontSize(8).font('Helvetica');
      }

      // Alternate row background
      if (index % 2 === 0) {
        doc
          .rect(this.MARGIN, currentY, this.PAGE_WIDTH, 15)
          .fillColor([240, 240, 240] as any)
          .fill();
      }

      // Row content
      doc.fillColor('black');
      let textX = this.MARGIN + 5;

      section.columns?.forEach((column, colIndex) => {
        const value = this.getNestedValue(row, column.key);
        const formattedValue = column.format
          ? column.format(value)
          : value?.toString() || '';
        const align = column.align || 'left';

        doc.text(formattedValue, textX, currentY + 3, {
          width: columnWidths[colIndex] - 10,
          align,
          ellipsis: true,
        });

        textX += columnWidths[colIndex];
      });

      currentY += 15;
    });

    doc.y = currentY + 10;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private addTextSection(
    doc: PDFKit.PDFDocument,
    section: ReportSection,
  ): void {
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .text(section.title, this.MARGIN, doc.y);
    doc.moveDown(0.3);

    doc.fontSize(9).font('Helvetica');

    if (typeof section.data === 'string') {
      doc.text(section.data, this.MARGIN, doc.y, {
        width: this.PAGE_WIDTH,
        align: 'justify',
      });
      doc.moveDown();
    } else if (Array.isArray(section.data)) {
      section.data.forEach((item) => {
        if (typeof item === 'string') {
          doc.text(`• ${item}`, this.MARGIN, doc.y, {
            width: this.PAGE_WIDTH,
          });
          doc.moveDown(0.3);
        }
      });
    }
  }

  // In your PdfService - generator.service.ts
  private addFooter(doc: PDFKit.PDFDocument, companyInfo: any) {
    try {
      const pageCount = doc.bufferedPageRange().count;

      // Make sure we have pages before trying to add footer
      if (pageCount === 0) return;

      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);

        // Add your footer content here
        doc
          .fontSize(10)
          .fillColor('#666666')
          .text(`Page ${i + 1} of ${pageCount}`, 50, doc.page.height - 50, {
            align: 'center',
          });
      }
    } catch (error) {
      console.error('Error adding footer:', error);
      // Don't throw error, just skip footer if there's an issue
    }
  }
}
