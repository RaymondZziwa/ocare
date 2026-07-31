import * as XLSX from 'xlsx';
import { BadRequestException } from '@nestjs/common';

export interface StockImportRow {
  productName: string;
  quantity: number;
}

export function parseStockExcel(buffer: Buffer): StockImportRow[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  // Explicitly cast to any[] to avoid unknown type errors
  const data: any[] = XLSX.utils.sheet_to_json(worksheet);

  if (!data || data.length === 0) {
    throw new BadRequestException('Excel file is empty.');
  }

  // Find column headers
  const headers = Object.keys(data[0]);
  const productCol = headers.find((h) => /product/i.test(h));
  const stockCol = headers.find(
    (h) => /current stock/i.test(h) || /stock/i.test(h) || /quantity/i.test(h),
  );

  if (!productCol) throw new BadRequestException('Column "Product" not found.');
  if (!stockCol)
    throw new BadRequestException('Column "Current stock" not found.');

  const result: StockImportRow[] = [];

  for (const row of data) {
    // row is now typed as any, so no TS errors
    const productName = row[productCol]?.toString().trim();
    const quantity = parseFloat(row[stockCol]);
    if (!productName || isNaN(quantity) || quantity < 0) {
      continue; // skip invalid rows
    }
    result.push({ productName, quantity });
  }

  return result;
}
