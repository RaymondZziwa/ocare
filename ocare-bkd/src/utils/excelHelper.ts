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

/**
 * Parses an Excel buffer and maps columns to the expected fields.
 * Uses exact case‑insensitive matching first, then keyword fallback.
 */
export function parseExcelForItems(buffer: Buffer): ExcelImportRow[] {
  // 1. Read workbook
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet) as any[];

  // 2. Validate
  if (!data || data.length === 0) {
    throw new BadRequestException('Excel file is empty or has no data rows.');
  }

  const headers = Object.keys(data[0]);
  console.log('📊 Excel Headers:', headers);

  // 3. Column mapping helper
  const findColumn = (exactNames: string[], fallbackKeywords: string[] = []): string | null => {
    // Try exact match (case‑insensitive, trimmed)
    for (const h of headers) {
      const trimmed = h.trim();
      if (exactNames.some(name => trimmed.toLowerCase() === name.toLowerCase())) {
        return trimmed;
      }
    }
    // Fallback: contains any keyword
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

  // 4. Map columns
  const colProduct = findColumn(['Product', 'Item Name', 'Name'], ['product', 'item']);
  const colBuyPrice = findColumn(['Unit Purchase Price', 'Purchase Price', 'Cost Price'], ['purchase', 'cost', 'buying']);
  const colSellPrice = findColumn(['Selling Price', 'Sale Price', 'Price'], ['selling', 'sale', 'price']);
  const colCategory = findColumn(['Category', 'Product Type', 'Type'], ['category', 'type']);
  const colBrand = findColumn(['Brand', 'Manufacturer', 'Supplier'], ['brand', 'manufacturer']);
  const colStock = findColumn(['Current stock', 'Stock', 'Quantity', 'Inventory'], ['stock', 'quantity', 'inventory']);

  console.log('✅ Mapped columns:', {
    Product: colProduct,
    'Unit Purchase Price': colBuyPrice,
    'Selling Price': colSellPrice,
    Category: colCategory,
    Brand: colBrand,
    'Current stock': colStock,
  });

  // 5. Parse each row
  return data.map((row: any, index: number) => {
    const getValue = (col: string | null): string => {
      if (!col) return '';
      const val = row[col];
      return val !== undefined && val !== null ? String(val).trim() : '';
    };

    const getNumber = (col: string | null): number => {
      const val = getValue(col);
      const num = parseFloat(val.replace(/,/g, ''));
      return isNaN(num) ? 0 : num;
    };

    const productName = getValue(colProduct);
    if (!productName) {
      console.warn(`⚠️ Row ${index + 1}: Missing product name – skipping`);
    }

    return {
      productName: productName || `Unnamed-${index + 1}`,
      buyingPrice: getNumber(colBuyPrice),
      sellingPrice: getNumber(colSellPrice),
      categoryName: getValue(colCategory),
      brandName: getValue(colBrand),
      alertStockLevel: getNumber(colStock),
    };
  });
}