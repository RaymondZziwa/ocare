// // src/utils/excelHelper.ts

// import * as XLSX from 'xlsx';
// import { BadRequestException } from '@nestjs/common';

// export interface ExcelImportRow {
//   productName: string;
//   buyingPrice: number;
//   sellingPrice: number;
//   categoryName: string;
//   sku?: string;
//   brandName: string;
//   alertStockLevel: number;
// }

// export function parseExcelForItems(buffer: Buffer): ExcelImportRow[] {
//   const workbook = XLSX.read(buffer, { type: 'buffer' });

//   const sheetName = workbook.SheetNames[0];

//   if (!sheetName) {
//     throw new BadRequestException('Excel file has no sheets.');
//   }

//   const worksheet = workbook.Sheets[sheetName];

//   const data = XLSX.utils.sheet_to_json(worksheet);

//   if (!data || data.length === 0) {
//     throw new BadRequestException('Excel file is empty.');
//   }

//   const headers = Object.keys(data[0]);

//   console.log('📊 Excel headers:', headers);
//   console.log('📋 First row sample:', data[0]);

//   // Find matching column names
//   const findColumn = (
//     exactNames: string[],
//     fallbackKeywords: string[] = [],
//   ): string | null => {
//     // Exact match
//     for (const header of headers) {
//       const trimmed = header.trim();

//       if (
//         exactNames.some((name) => trimmed.toLowerCase() === name.toLowerCase())
//       ) {
//         return trimmed;
//       }
//     }

//     // Keyword fallback
//     for (const header of headers) {
//       const lower = header.toLowerCase();

//       if (
//         fallbackKeywords.some((keyword) =>
//           lower.includes(keyword.toLowerCase()),
//         )
//       ) {
//         return header;
//       }
//     }

//     return null;
//   };

//   const colProduct = findColumn(
//     ['Product', 'Item Name', 'Name'],
//     ['product', 'item'],
//   );

//   const colBuyPrice = findColumn(
//     ['BuyingPrice', 'Buying Price', 'Purchase Price', 'Unit Purchase Price'],
//     ['buying', 'purchase', 'cost'],
//   );

//   const colSellPrice = findColumn(
//     ['SellingPrice', 'Selling Price', 'Sale Price', 'Price'],
//     ['selling', 'sale', 'price'],
//   );

//   const colSku = findColumn(
//     ['SKU', 'Stock Keeping Unit', 'Product Code'],
//     ['sku', 'product code'],
//   );

//   const colCategory = findColumn(
//     ['Category', 'Product Type', 'Type'],
//     ['category', 'type'],
//   );

//   const colBrand = findColumn(
//     ['Brand', 'Manufacturer'],
//     ['brand', 'manufacturer'],
//   );

//   console.log('✅ Mapped columns:', {
//     Product: colProduct,
//     BuyingPrice: colBuyPrice,
//     SellingPrice: colSellPrice,
//     SKU: colSku,
//     Category: colCategory,
//     Brand: colBrand,
//   });

//   const getValue = (
//     row: Record<string, any>,
//     column: string | null,
//   ): string => {
//     if (!column) return '';

//     const value = row[column];

//     if (value === undefined || value === null) {
//       return '';
//     }

//     return String(value).trim();
//   };

//   const getNumber = (
//     row: Record<string, any>,
//     column: string | null,
//   ): number => {
//     const value = getValue(row, column);

//     if (!value) return 0;

//     const cleaned = value.replace(/[^0-9.]/g, '');

//     const number = parseFloat(cleaned);

//     return Number.isNaN(number) ? 0 : number;
//   };

//   return data.map((row, index) => {
//     const productName = getValue(row, colProduct);

//     const buyingPrice = getNumber(row, colBuyPrice);

//     const sellingPrice = getNumber(row, colSellPrice);

//     const sku = colSku ? getValue(row, colSku) : undefined;

//     if (index < 5) {
//       console.log(`🔎 Row ${index + 1}:`, {
//         productName,
//         sku,
//         buyingPrice,
//         sellingPrice,
//         category: getValue(row, colCategory),
//         brand: getValue(row, colBrand),
//       });
//     }

//     return {
//       productName: productName || `Unnamed-${index + 1}`,
//       buyingPrice,
//       sellingPrice,
//       sku,
//       categoryName: getValue(row, colCategory),
//       brandName: getValue(row, colBrand),
//       alertStockLevel: 0,
//     };
//   });
// }
