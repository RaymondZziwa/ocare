// src/utils/excelHelper.ts
import * as XLSX from 'xlsx';
import { BadRequestException } from '@nestjs/common';

export interface ExcelImportRow {
  productName: string;
  buyingPrice: number;
  sellingPrice: number;
  categoryName: string;
  brandName: string;
  alertStockLevel: number;
}

export function parseExcelForItems(buffer: Buffer): ExcelImportRow[] {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet) as any[];

  if (!data || data.length === 0) {
    throw new BadRequestException('Excel file is empty.');
  }

  const headers = Object.keys(data[0]);
  console.log('📊 Excel headers:', headers);
  console.log('📋 First row sample:', data[0]);

  // Helper: try exact match first, then fallback to keyword search
  const findColumn = (exactNames: string[], fallbackKeywords: string[] = []): string | null => {
    // Exact match (case‑insensitive, trimmed)
    for (const h of headers) {
      const trimmed = h.trim();
      if (exactNames.some(name => trimmed.toLowerCase() === name.toLowerCase())) {
        return trimmed;
      }
    }
    // Fallback: header contains any of the keywords
    if (fallbackKeywords.length) {
      for (const h of headers) {
        const lower = h.toLowerCase();
        if (fallbackKeywords.some(kw => lower.includes(kw.toLowerCase()))) {
          return h;
        }
      }
    }
    return null;
  };

  // Map columns – add exact names you expect, and fallback keywords
  const colProduct = findColumn(
    ['Product', 'Item Name', 'Name'],
    ['product', 'item']
  );
  const colBuyPrice = findColumn(
    ['BuyingPrice', 'Buying Price', 'Purchase Price', 'Unit Purchase Price'],
    ['buying', 'purchase', 'cost']
  );
  const colSellPrice = findColumn(
    ['SellingPrice', 'Selling Price', 'Sale Price', 'Price'],
    ['selling', 'sale', 'price']
  );
  const colCategory = findColumn(
    ['Category', 'Product Type', 'Type'],
    ['category', 'type']
  );
  const colBrand = findColumn(
    ['Brand', 'Manufacturer'],
    ['brand', 'manufacturer']
  );
  // We don't have a stock column – we'll default to 0

  console.log('✅ Mapped columns:', {
    Product: colProduct,
    BuyingPrice: colBuyPrice,
    SellingPrice: colSellPrice,
    Category: colCategory,
    Brand: colBrand,
  });

  return data.map((row: any, index: number) => {
    const getValue = (col: string | null): string => {
      if (!col) return '';
      const val = row[col];
      return val !== undefined && val !== null ? String(val).trim() : '';
    };

    const getNumber = (col: string | null): number => {
      const raw = getValue(col);
      if (!raw) return 0;
      const cleaned = raw.replace(/[^0-9.]/g, '');
      const num = parseFloat(cleaned);
      return isNaN(num) ? 0 : num;
    };

    const productName = getValue(colProduct);
    const buyingPrice = getNumber(colBuyPrice);
    const sellingPrice = getNumber(colSellPrice);

    if (index < 5) {
      console.log(`🔎 Row ${index + 1}:`, {
        productName,
        rawBuying: row[colBuyPrice || ''] || 'N/A',
        buyingPrice,
        rawSelling: row[colSellPrice || ''] || 'N/A',
        sellingPrice,
      });
    }

    return {
      productName: productName || `Unnamed-${index + 1}`,
      buyingPrice,
      sellingPrice,
      categoryName: getValue(colCategory),
      brandName: getValue(colBrand),
      alertStockLevel: 0,
    };
  });
}