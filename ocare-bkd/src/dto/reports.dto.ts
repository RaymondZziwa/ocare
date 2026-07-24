import { IsString, IsEnum, IsOptional, IsDateString } from 'class-validator';

export enum ReportFormat {
  PDF = 'PDF',
  EXCEL = 'EXCEL',
  JSON = 'JSON',
}

export enum StockLevel {
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  LOW_STOCK = 'LOW_STOCK',
  IN_STOCK = 'IN_STOCK',
  OVERSTOCK = 'OVERSTOCK',
}

export class StockReportFilterDto {
  @IsString()
  storeId: number;

  @IsOptional()
  @IsEnum(StockLevel)
  stockLevel?: StockLevel;

  @IsOptional()
  @IsString()  categoryId?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat;
}

export class StockLevelAnalysis {
  itemId: number;
  itemName: string;
  categoryName: string;
  currentStock: number;
  unitName: string;
  minStockLevel?: number;
  maxStockLevel?: number;
  stockLevel: StockLevel;
  lastUpdated: Date;
  value: number; // stock value based on cost price
}

export class StoreStockReport {
  storeId: number;
  storeName: string;
  generatedAt: Date;
  totalItems: number;
  totalStockValue: number;
  outOfStockItems: number;
  lowStockItems: number;
  inStockItems: number;
  overstockItems: number;
  stockLevelAnalysis: StockLevelAnalysis[];
  summary: {
    categoryBreakdown: Array<{
      categoryName: string;
      itemCount: number;
      stockValue: number;
    }>;
    stockLevelSummary: Array<{
      level: StockLevel;
      count: number;
      percentage: number;
    }>;
  };
}
