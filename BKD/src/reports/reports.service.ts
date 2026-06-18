import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ExpenseCategory, Prisma } from '@prisma/client';
import { CompanyService } from 'src/company-profile/profile.service';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  PdfService,
  ReportConfig,
  ReportSection,
} from 'src/utils/pdfGenerator/generator.service';

interface MovementWhereInput {
  storeId?: string;
  category?: 'RESTOCK' | 'DEPLETION' | 'ADJUSTMENT';
  createdAt?: {
    gte?: Date;
    lte?: Date;
  };
  itemId?: string;
  item?: { categoryId?: string };
}

// Define interface for product sales
interface ProductSale {
  saleId: string;
  date: Date;
  store: string;
  quantity: number;
  price: number;
  total: number;
  discount: number;
}

@Injectable()
export class ReportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
    private readonly companyService: CompanyService,
  ) {}

  //inventory reports
  async stockLevelAnalysis(storeId?: string) {
    const inventory = await this.prisma.productInventory.findMany({
      where: storeId ? { storeId } : {},
      select: {
        item: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
        unit: {
          select: {
            name: true,
          },
        },
        qty: true,
        store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const lowStockItems = inventory.filter((item) => item.qty <= 20);
    const inStockItems = inventory.filter(
      (item) => item.qty > 20 && item.qty <= 100,
    );
    const overStockedItems = inventory.filter((item) => item.qty > 100);

    return {
      status: 200,
      data: {
        lowStockItems,
        inStockItems,
        overStockedItems,
      },
      message: 'Stock level analysis fetched successfully',
    };
  }

  async exportStockLevelAnalysisPDF(storeId: string) {
    const reportData = await this.stockLevelAnalysis(storeId);
    const companyInfo = await this.companyService.getProfile();
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    // Validate required data
    if (!store) {
      throw new NotFoundException(`Store with ID ${storeId} not found`);
    }

    if (!companyInfo) {
      throw new NotFoundException('Company profile not found');
    }

    // Access data from the response object
    const { lowStockItems, inStockItems, overStockedItems } = reportData.data;

    const config: ReportConfig = {
      title: 'Stock Level Analysis Report',
      subtitle: `Store: ${store.name}`,
      filters: {
        Store: store.name,
        'Generated Date': new Date().toLocaleDateString(),
      },
      summary: {
        cards: [
          {
            title: 'Low Stock Items',
            value: lowStockItems.length,
            subtitle: 'Need reordering',
            color: [255, 165, 0], // Orange
          },
          {
            title: 'In Stock Items',
            value: inStockItems.length,
            subtitle: 'Adequate stock',
            color: [0, 128, 0], // Green
          },
          {
            title: 'Overstocked Items',
            value: overStockedItems.length,
            subtitle: 'Excess inventory',
            color: [0, 0, 255], // Blue
          },
        ],
      },
      sections: [
        {
          title: 'Low Stock Items',
          type: 'table',
          data: lowStockItems,
          columns: [
            { header: 'Item Name', key: 'item.name', width: 100 },
            { header: 'Category', key: 'item.category.name', width: 100 },
            {
              header: 'Current Stock',
              key: 'qty',
              width: 150,
              align: 'center',
            },
            {
              header: 'Status',
              key: 'qty',
              width: 100,
              align: 'center',
              format: () => 'Low Stock',
            },
          ],
        },
        {
          title: 'In Stock Items',
          type: 'table',
          data: inStockItems,
          columns: [
            { header: 'Item Name', key: 'item.name', width: 100 },
            { header: 'Category', key: 'item.category.name', width: 100 },
            {
              header: 'Current Stock',
              key: 'qty',
              width: 150,
              align: 'center',
            },
            {
              header: 'Status',
              key: 'qty',
              width: 100,
              align: 'center',
              format: () => 'Adequate',
            },
          ],
        },
        {
          title: 'Overstocked Items',
          type: 'table',
          data: overStockedItems,
          columns: [
            { header: 'Item Name', key: 'item.name', width: 100 },
            { header: 'Category', key: 'item.category.name', width: 100 },
            {
              header: 'Current Stock',
              key: 'qty',
              width: 150,
              align: 'center',
            },
            {
              header: 'Status',
              key: 'qty',
              width: 100,
              align: 'center',
              format: () => 'Overstocked',
            },
          ],
        },
      ],
      companyInfo,
    };

    const pdfBuffer = await this.pdfService.generateReportPDF(config);

    return {
      buffer: pdfBuffer,
      filename: `stock-level-analysis-${store.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`,
      mimeType: 'application/pdf',
    };
  }

  async stockMovementAnalysis(
    storeId?: string,
    startDate?: string,
    endDate?: string,
    itemId?: string,
    categoryId?: string,
    movementType?: string,
  ) {
    const where: MovementWhereInput = {};

    if (storeId) {
      where.storeId = storeId;
    }

    if (startDate || endDate) {
      where.createdAt = {};

      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }

      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDateTime;
      }
    }

    if (itemId) {
      where.itemId = itemId;
    }

    if (categoryId) {
      where.item = {
        categoryId: categoryId,
      };
    }

    if (movementType) {
      where.category = movementType as 'RESTOCK' | 'DEPLETION' | 'ADJUSTMENT';
    }

    const movements = await this.prisma.inventoryRecord.findMany({
      where,
      include: {
        item: {
          include: {
            category: true,
          },
        },
        store: true,
        unit: true,
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Enhanced movement classification
    const movementTypes = {
      IN: ['RESTOCK', 'STOCK_TRANSFER'], // Transfer can be IN depending on context
      OUT: ['DEPLETE'],
      ADJUSTMENT: ['STOCK_ADJUSTMENT'],
    };

    const totalIn = movements
      .filter((m) => movementTypes.IN.includes(m.category))
      .reduce((sum, m) => sum + m.qty, 0);

    const totalOut = movements
      .filter((m) => movementTypes.OUT.includes(m.category))
      .reduce((sum, m) => sum + m.qty, 0);

    const summary = {
      totalMovements: movements.length,
      totalIn,
      totalOut,
      netMovement: totalIn - totalOut,
      movementBreakdown: {
        stockIn: movements.filter((m) => m.category === 'RESTOCK').length,
        stockOut: movements.filter((m) => m.category === 'DEPLETION').length,
        adjustments: movements.filter((m) => m.category === 'ADJUSTMENT')
          .length,
      },
      quantityBreakdown: {
        stockIn: movements
          .filter((m) => m.category === 'RESTOCK')
          .reduce((sum, m) => sum + m.qty, 0),
        stockOut: movements
          .filter((m) => m.category === 'DEPLETION')
          .reduce((sum, m) => sum + m.qty, 0),
        adjustments: movements
          .filter((m) => m.category === 'ADJUSTMENT')
          .reduce((sum, m) => sum + m.qty, 0),
      },
    };

    return {
      status: 200,
      data: {
        movements,
        summary,
        filters: { storeId, startDate, endDate, itemId, categoryId },
      },
      message: 'Stock movement analysis fetched successfully',
    };
  }

  async exportStockMovementAnalysisPDF(
    storeId: string,
    startDate?: string,
    endDate?: string,
    itemId?: string,
    categoryId?: string,
    movementType?: string,
  ) {
    // Get the movement analysis data with filters
    const reportData = await this.stockMovementAnalysis(
      storeId,
      startDate,
      endDate,
      itemId ? itemId : undefined,
      categoryId ? categoryId : undefined,
      movementType,
    );

    const companyInfo = await this.companyService.getProfile();
    const store = await this.prisma.store.findUnique({
      where: { id: storeId },
    });

    // Validate required data
    if (!store) {
      throw new NotFoundException(`Store with ID ${storeId} not found`);
    }

    if (!companyInfo) {
      throw new NotFoundException('Company profile not found');
    }

    // Access data from the response object
    const { movements, summary, filters: appliedFilters } = reportData.data;

    // Build filters description for the report
    const filterDescriptions: Record<string, string> = {
      Store: store.name,
      'Generated Date': new Date().toLocaleDateString(),
    };

    // Add active filters to the description
    if (startDate)
      filterDescriptions['Start Date'] = new Date(
        startDate,
      ).toLocaleDateString();
    if (endDate)
      filterDescriptions['End Date'] = new Date(endDate).toLocaleDateString();
    if (movementType) {
      const movementLabels = {
        RESTOCK: 'Stock In',
        DEPLETION: 'Stock Out',
        ADJUSTMENT: 'Adjustment',
      };
      filterDescriptions['Movement Type'] =
        movementLabels[movementType] || movementType;
    }
    if (itemId) {
      const item = movements.find((m) => m.itemId === itemId)?.item;
      filterDescriptions['Item'] = item?.name || 'Selected Item';
    }
    if (categoryId) {
      const category = movements.find(
        (m) => m.item.categoryId === categoryId,
      )?.item.category;
      filterDescriptions['Category'] = category?.name || 'Selected Category';
    }

    const config: ReportConfig = {
      title: 'Stock Movement Analysis Report',
      subtitle: `Store: ${store.name}`,
      filters: filterDescriptions,
      summary: {
        cards: [
          {
            title: 'Total Movements',
            value: summary.totalMovements,
            subtitle: 'records',
            color: [79, 70, 229], // Indigo
          },
          {
            title: 'Total Stock In',
            value: summary.totalIn,
            subtitle: 'units',
            color: [0, 128, 0], // Green
          },
          {
            title: 'Total Stock Out',
            value: summary.totalOut,
            subtitle: 'units',
            color: [220, 38, 38], // Red
          },
        ],
      },
      sections: [
        {
          title: 'Movement Summary by Type',
          type: 'table',
          data: [
            {
              type: 'Stock In',
              count: summary.movementBreakdown.stockIn,
              quantity: summary.quantityBreakdown.stockIn,
            },
            {
              type: 'Stock Out',
              count: summary.movementBreakdown.stockOut,
              quantity: summary.quantityBreakdown.stockOut,
            },
            {
              type: 'Adjustments',
              count: summary.movementBreakdown.adjustments,
              quantity: summary.quantityBreakdown.adjustments,
            },
          ],
          columns: [
            { header: 'Movement Type', key: 'type', width: 120 },
            { header: 'Count', key: 'count', width: 80, align: 'center' },
            {
              header: 'Quantity',
              key: 'quantity',
              width: 100,
              align: 'center',
              format: (value) => value?.toString() || '0',
            },
          ],
        },
        {
          title: 'Detailed Movement Records',
          type: 'table',
          data: movements,
          columns: [
            {
              header: 'Date',
              key: 'createdAt',
              width: 60,
              format: (value) =>
                new Date(value).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                }),
            },
            { header: 'Item', key: 'item.name', width: 60 },
            { header: 'Category', key: 'item.category.name', width: 60 },
            {
              header: 'Type',
              key: 'category',
              width: 60,
              format: (value) => {
                const typeMap = {
                  RESTOCK: 'Stock In',
                  DEPLETION: 'Stock Out',
                  ADJUSTMENT: 'Adjustment',
                };
                return typeMap[value] || value;
              },
            },
            {
              header: 'Quantity',
              key: 'qty',
              width: 60,
              align: 'center',
              format: (value) => value?.toString() || '0',
            },
            { header: 'Unit', key: 'unit.abr', width: 60, align: 'center' },
            {
              header: 'Recorded By',
              key: 'employee',
              width: 80,
              format: (employee) =>
                employee ? `${employee.firstName} ${employee.lastName}` : 'N/A',
            },
          ],
        },
      ],
      companyInfo,
    };

    const pdfBuffer = await this.pdfService.generateReportPDF(config);

    // Generate filename with filter information
    let filename = `stock-movement-${store.name.replace(/\s+/g, '-')}`;

    // Add date range to filename if applicable
    if (startDate && endDate) {
      const start = new Date(startDate).toISOString().split('T')[0];
      const end = new Date(endDate).toISOString().split('T')[0];
      filename += `-${start}-to-${end}`;
    } else if (startDate) {
      const start = new Date(startDate).toISOString().split('T')[0];
      filename += `-from-${start}`;
    } else if (endDate) {
      const end = new Date(endDate).toISOString().split('T')[0];
      filename += `-until-${end}`;
    } else {
      filename += `-${new Date().toISOString().split('T')[0]}`;
    }

    // Add movement type to filename if applicable
    if (movementType) {
      const typeLabel =
        movementType === 'RESTOCK'
          ? 'in'
          : movementType === 'DEPLETION'
            ? 'out'
            : movementType.toLowerCase();
      filename += `-${typeLabel}`;
    }

    filename += '.pdf';

    return {
      buffer: pdfBuffer,
      filename,
      mimeType: 'application/pdf',
    };
  }

  //sales reports
  // Daily Sales Summary
  async dailySalesSummary(storeId?: string, date?: string) {
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const nextDay = new Date(targetDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const whereCondition: any = {
      createdAt: {
        gte: targetDate,
        lt: nextDay,
      },
    };

    if (storeId) {
      whereCondition.storeId = storeId;
    }

    const sales = await this.prisma.sale.findMany({
      where: whereCondition,
      include: {
        store: {
          select: {
            id: true,
            name: true,
          },
        },
        client: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        employee: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate summary
    const totalRevenue = sales.reduce(
      (sum, sale) => sum + Number(sale.total),
      0,
    );
    const totalBalance = sales.reduce(
      (sum, sale) => sum + Number(sale.balance),
      0,
    );
    const totalPaid = totalRevenue - totalBalance;

    // Sales by status
    const salesByStatus = sales.reduce((acc, sale) => {
      acc[sale.status] = (acc[sale.status] || 0) + 1;
      return acc;
    }, {});

    // Payment methods summary
    const paymentMethodsSummary = sales.reduce((acc, sale) => {
      const methods = sale.paymentMethods as any[];
      methods.forEach((method) => {
        const type = method.type.toUpperCase();
        if (!acc[type]) {
          acc[type] = { type, amount: 0, count: 0 };
        }
        acc[type].amount += method.amount;
        acc[type].count += 1;
      });
      return acc;
    }, {});

    return {
      status: 200,
      data: {
        sales,
        summary: {
          totalRevenue,
          totalPaid,
          totalBalance,
          totalSales: sales.length,
          salesByStatus,
          paymentMethods: Object.values(paymentMethodsSummary),
          date: targetDate.toISOString().split('T')[0],
        },
        store: sales.length > 0 ? sales[0].store : null,
      },
      message: 'Daily sales summary fetched successfully',
    };
  }

  // Period Sales Summary
  async periodSalesSummary(
    storeId?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const whereCondition: any = {};

    // Date range filter
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      whereCondition.createdAt = {
        gte: start,
        lte: end,
      };
    } else if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      whereCondition.createdAt = {
        gte: start,
      };
    }

    if (storeId) {
      whereCondition.storeId = storeId;
    }

    const sales = await this.prisma.sale.findMany({
      where: whereCondition,
      include: {
        store: {
          select: {
            id: true,
            name: true,
          },
        },
        client: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate summary
    const totalRevenue = sales.reduce(
      (sum, sale) => sum + Number(sale.total),
      0,
    );
    const totalBalance = sales.reduce(
      (sum, sale) => sum + Number(sale.balance),
      0,
    );
    const totalPaid = totalRevenue - totalBalance;

    // Daily breakdown
    const dailyBreakdown = sales.reduce((acc, sale) => {
      const date = sale.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          revenue: 0,
          salesCount: 0,
          paidAmount: 0,
        };
      }
      acc[date].revenue += Number(sale.total);
      acc[date].salesCount += 1;
      acc[date].paidAmount += Number(sale.total) - Number(sale.balance);
      return acc;
    }, {});

    return {
      status: 200,
      data: {
        sales,
        summary: {
          totalRevenue,
          totalPaid,
          totalBalance,
          totalSales: sales.length,
          averageSale: sales.length > 0 ? totalRevenue / sales.length : 0,
          period: {
            startDate: startDate || 'N/A',
            endDate: endDate || 'N/A',
          },
        },
        dailyBreakdown: Object.values(dailyBreakdown),
        store: sales.length > 0 ? sales[0].store : null,
      },
      message: 'Period sales summary fetched successfully',
    };
  }

  // Store Sales Comparison
  async storeSalesComparison(startDate?: string, endDate?: string) {
    const whereCondition: any = {};

    // Date range filter
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      whereCondition.createdAt = {
        gte: start,
        lte: end,
      };
    }

    const sales = await this.prisma.sale.findMany({
      where: whereCondition,
      include: {
        store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Group sales by store
    const storeData = sales.reduce((acc, sale) => {
      const storeId = sale.storeId;
      if (!acc[storeId]) {
        acc[storeId] = {
          id: storeId,
          name: sale.store.name,
          totalRevenue: 0,
          salesCount: 0,
          totalPaid: 0,
          totalBalance: 0,
        };
      }

      acc[storeId].totalRevenue += Number(sale.total);
      acc[storeId].salesCount += 1;
      acc[storeId].totalPaid += Number(sale.total) - Number(sale.balance);
      acc[storeId].totalBalance += Number(sale.balance);

      return acc;
    }, {});

    const stores = Object.values(storeData);

    // Sort by total revenue (descending)
    stores.sort((a: any, b: any) => b.totalRevenue - a.totalRevenue);

    // Calculate overall summary
    const totalRevenue = stores.reduce(
      (sum: number, store: any) => sum + Number(store.totalRevenue),
      0,
    );
    const totalSales = stores.reduce(
      (sum: number, store: any) => sum + store.salesCount,
      0,
    );

    // Add percentage share
    stores.forEach((store: any) => {
      store.revenueShare =
        Number(totalRevenue) > 0
          ? (store.totalRevenue / Number(totalRevenue)) * 100
          : 0;
    });

    return {
      status: 200,
      data: {
        stores,
        summary: {
          totalRevenue,
          totalSales,
          storeCount: stores.length,
          period: {
            startDate: startDate || 'N/A',
            endDate: endDate || 'N/A',
          },
        },
      },
      message: 'Store sales comparison fetched successfully',
    };
  }

  // Massage Service Sales

  async massageServiceSales(
    serviceId?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const whereCondition: any = {};

    // Date range filter
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      whereCondition.createdAt = {
        gte: start,
        lte: end,
      };
    }

    const sales = await this.prisma.sale.findMany({
      where: whereCondition,
      include: {
        store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const processedSales = sales.map((sale) => {
      const items = Array.isArray(sale.items)
        ? sale.items
        : typeof sale.items === 'string'
          ? JSON.parse(sale.items)
          : [];

      return {
        ...sale,
        items,
      };
    });

    const servicePerformanceMap = new Map<string, any>();

    processedSales.forEach((sale) => {
      sale.items.forEach((item: any) => {
        const serviceKey = String(item.serviceId ?? item.id);
        if (!serviceKey) return;

        const current = servicePerformanceMap.get(serviceKey) ?? {
          id: serviceKey,
          name: item.serviceName || item.name || 'Unknown Service',
          totalRevenue: 0,
          totalQuantity: 0,
          salesCount: 0,
          price: Number(item.price || 0),
        };

        current.totalRevenue += Number(item.total || 0);
        current.totalQuantity += Number(item.quantity || 0);
        current.salesCount += 1;
        current.price = Number(item.price || current.price || 0);

        servicePerformanceMap.set(serviceKey, current);
      });
    });

    const filteredSales = serviceId
      ? processedSales.filter((sale) =>
          sale.items.some(
            (item: any) =>
              String(item.serviceId ?? item.id) === String(serviceId),
          ),
        )
      : processedSales;

    const filteredTotalRevenue = filteredSales.reduce(
      (sum, sale) => sum + Number(sale.total),
      0,
    );
    const filteredTotalPaid = filteredSales.reduce(
      (sum, sale) => sum + (Number(sale.total) - Number(sale.balance)),
      0,
    );
    const filteredTotalBalance = filteredSales.reduce(
      (sum, sale) => sum + Number(sale.balance),
      0,
    );

    const periodStart =
      processedSales.length > 0
        ? new Date(
            Math.min(...processedSales.map((sale) => sale.createdAt.getTime())),
          )
        : null;
    const periodEnd =
      processedSales.length > 0
        ? new Date(
            Math.max(...processedSales.map((sale) => sale.createdAt.getTime())),
          )
        : null;

    return {
      status: 200,
      data: {
        sales: filteredSales,
        summary: {
          totalRevenue: filteredTotalRevenue,
          totalPaid: filteredTotalPaid,
          totalBalance: filteredTotalBalance,
          totalSales: filteredSales.length,
          averageSale:
            filteredSales.length > 0
              ? filteredTotalRevenue / filteredSales.length
              : 0,
        },
        servicePerformance: Array.from(servicePerformanceMap.values()).sort(
          (a: any, b: any) => b.totalRevenue - a.totalRevenue,
        ),
        period: {
          startDate:
            startDate ||
            (periodStart ? periodStart.toISOString().split('T')[0] : null),
          endDate:
            endDate ||
            (periodEnd ? periodEnd.toISOString().split('T')[0] : null),
        },
        service: serviceId
          ? servicePerformanceMap.get(String(serviceId)) || null
          : null,
      },
      message: 'Massage service sales fetched successfully',
    };
  }

  // Get Massage Services List
  async getMassageServicesList() {
    const sales = await this.prisma.sale.findMany({
      select: {
        items: true,
      },
    });

    const servicesMap = new Map<string, any>();

    sales.forEach((sale) => {
      const items = Array.isArray(sale.items)
        ? sale.items
        : typeof sale.items === 'string'
          ? JSON.parse(sale.items)
          : [];

      items.forEach((item: any) => {
        const serviceId = item.serviceId ?? item.id;
        if (serviceId == null) return;

        const serviceKey = String(serviceId);
        if (!servicesMap.has(serviceKey)) {
          servicesMap.set(serviceKey, {
            id: serviceId,
            name: (item.serviceName || item.name || 'Unknown Service').trim(),
            price: Number(item.price || 0),
          });
        }
      });
    });

    const services = Array.from(servicesMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    return {
      status: 200,
      data: services,
      message: 'Massage services list fetched successfully',
    };
  }

  // Product Performance
  async productPerformance(
    itemId: string,
    storeId?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const whereCondition: any = {};

    // Date range filter
    if (startDate && endDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      whereCondition.createdAt = {
        gte: start,
        lte: end,
      };
    }

    if (storeId) {
      whereCondition.storeId = storeId;
    }
    const sales = await this.prisma.sale.findMany({
      where: whereCondition,
      include: {
        store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Process items from all sales to find the specific product
    const productData = {
      id: itemId,
      name: '',
      category: '',
      totalUnitsSold: 0,
      totalRevenue: 0,
      averagePrice: 0,
      salesCount: 0,
      stores: new Set<string>(),
    };

    const salesWithProduct: {
      saleId: string;
      date: Date;
      store: string;
      quantity: number;
      price: number;
      total: number;
      discount: number;
    }[] = [];

    for (const sale of sales) {
      const items = sale.items as any[];
      const productInSale = items.find((item) => item.id === itemId);

      if (productInSale) {
        // Initialize product data if this is the first occurrence
        if (productData.totalUnitsSold === 0) {
          productData.name = productInSale.name;
          productData.category = productInSale.category?.name || 'Unknown';
        }

        productData.totalUnitsSold += productInSale.quantity;
        productData.totalRevenue += productInSale.total;
        productData.salesCount += 1;
        productData.stores.add(sale.storeId.toString());

        salesWithProduct.push({
          saleId: sale.id,
          date: sale.createdAt,
          store: sale.store.name,
          quantity: productInSale.quantity,
          price: Number(productInSale.price),
          total: productInSale.total,
          discount: productInSale.discount,
        });
      }
    }

    // Calculate averages
    if (productData.totalUnitsSold > 0) {
      productData.averagePrice =
        productData.totalRevenue / productData.totalUnitsSold;
    }

    return {
      status: 200,
      data: {
        product: {
          ...productData,
          storeCount: productData.stores.size,
        },
        sales: salesWithProduct,
        summary: {
          totalUnitsSold: productData.totalUnitsSold,
          totalRevenue: productData.totalRevenue,
          averagePrice: productData.averagePrice,
          salesCount: productData.salesCount,
          storeCount: productData.stores.size,
        },
        period: {
          startDate: startDate || 'N/A',
          endDate: endDate || 'N/A',
        },
      },
      message:
        productData.totalUnitsSold > 0
          ? 'Product performance data fetched successfully'
          : 'No sales data found for the specified product',
    };
  }

  async exportSalesReportToPDF(
    reportType:
      | 'daily-sales'
      | 'period-sales'
      | 'store-comparison'
      | 'massage-services'
      | 'product-performance',
    filters: {
      storeId?: string;
      date?: string;
      startDate?: string;
      endDate?: string;
      serviceId?: string;
      itemId?: string;
    },
  ) {
    let reportData: any;
    let title = '';
    let subtitle = '';

    // Fetch the appropriate report data
    switch (reportType) {
      case 'daily-sales':
        reportData = await this.dailySalesSummary(
          filters.storeId?.toString(),
          filters.date,
        );
        title = 'Daily Sales Summary Report';
        subtitle = filters.date
          ? `Date: ${new Date(filters.date).toLocaleDateString()}`
          : `Date: ${new Date().toLocaleDateString()}`;
        break;

      case 'period-sales':
        reportData = await this.periodSalesSummary(
          filters.storeId?.toString(),
          filters.startDate,
          filters.endDate,
        );
        title = 'Period Sales Summary Report';
        subtitle = this.buildPeriodSubtitle(filters.startDate, filters.endDate);
        break;

      case 'store-comparison':
        reportData = await this.storeSalesComparison(
          filters.startDate,
          filters.endDate,
        );
        title = 'Store Sales Comparison Report';
        subtitle = this.buildPeriodSubtitle(filters.startDate, filters.endDate);
        break;

      case 'massage-services':
        reportData = await this.massageServiceSales(
          filters.serviceId?.toString(),
          filters.startDate,
          filters.endDate,
        );
        title = 'Massage Service Sales Report';
        subtitle = this.buildPeriodSubtitle(filters.startDate, filters.endDate);
        break;

      case 'product-performance':
        if (!filters.itemId) {
          throw new BadRequestException(
            'Item ID is required for product performance report',
          );
        }
        reportData = await this.productPerformance(
          filters.itemId,
          filters.storeId,
          filters.startDate,
          filters.endDate,
        );
        title = 'Product Performance Report';
        subtitle = `Product: ${reportData.data.product?.name || filters.itemId}`;
        break;
    }

    const companyInfo = await this.companyService.getProfile();

    if (!companyInfo) {
      throw new NotFoundException('Company profile not found');
    }

    // Build report configuration
    const config: ReportConfig = {
      title,
      subtitle,
      filters: this.buildSalesFilters(reportType, filters, reportData),
      companyInfo,
      sections: this.buildSalesSections(reportType, reportData),
    };

    // Add summary section
    if (reportData.data.summary) {
      config.summary = this.buildSalesSummary(
        reportType,
        reportData.data.summary,
      );
    }

    const pdfBuffer = await this.pdfService.generateReportPDF(config);

    // Generate filename
    const filename = this.generateSalesFilename(
      reportType,
      filters,
      reportData,
    );

    return {
      buffer: pdfBuffer,
      filename,
      mimeType: 'application/pdf',
    };
  }

  // Helper methods for PDF generation
  private buildPeriodSubtitle(startDate?: string, endDate?: string): string {
    if (startDate && endDate) {
      return `Period: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`;
    } else if (startDate) {
      return `From: ${new Date(startDate).toLocaleDateString()}`;
    } else {
      return 'All Time Period';
    }
  }

  private buildSalesFilters(
    reportType: string,
    filters: any,
    reportData: any,
  ): Record<string, any> {
    const filterDescriptions: Record<string, any> = {
      'Report Type': reportType.replace('-', ' ').toUpperCase(),
      'Generated Date': new Date().toLocaleDateString(),
    };

    switch (reportType) {
      case 'daily-sales':
        if (filters.date) {
          filterDescriptions['Date'] = new Date(
            filters.date,
          ).toLocaleDateString();
        }
        if (reportData.data.store) {
          filterDescriptions['Store'] = reportData.data.store.name;
        }
        break;

      case 'period-sales':
        if (filters.startDate && filters.endDate) {
          filterDescriptions['Period'] =
            `${filters.startDate} to ${filters.endDate}`;
        }
        if (reportData.data.store) {
          filterDescriptions['Store'] = reportData.data.store.name;
        }
        break;

      case 'store-comparison':
        if (filters.startDate && filters.endDate) {
          filterDescriptions['Period'] =
            `${filters.startDate} to ${filters.endDate}`;
        }
        break;

      case 'massage-services':
        if (filters.startDate && filters.endDate) {
          filterDescriptions['Period'] =
            `${filters.startDate} to ${filters.endDate}`;
        }
        if (filters.serviceId && reportData.data.servicePerformance?.[0]) {
          filterDescriptions['Service'] =
            reportData.data.servicePerformance[0].name;
        }
        break;

      case 'product-performance':
        if (filters.startDate && filters.endDate) {
          filterDescriptions['Period'] =
            `${filters.startDate} to ${filters.endDate}`;
        }
        if (filters.storeId && reportData.data.product) {
          filterDescriptions['Store'] =
            reportData.data.product.storeCount > 1
              ? 'Multiple Stores'
              : 'Single Store';
        }
        break;
    }

    return filterDescriptions;
  }

  private buildSalesSummary(reportType: string, summary: any): any {
    switch (reportType) {
      case 'daily-sales':
      case 'period-sales':
        return {
          cards: [
            {
              title: 'Total Revenue',
              value: `UGX ${summary.totalRevenue.toLocaleString()}`,
              subtitle: 'Gross sales',
              color: [16, 185, 129], // Green
            },
            {
              title: 'Total Sales',
              value: summary.totalSales,
              subtitle: 'Transactions',
              color: [79, 70, 229], // Indigo
            },
            {
              title: 'Amount Paid',
              value: `UGX ${summary.totalPaid.toLocaleString()}`,
              subtitle: 'Collected',
              color: [16, 185, 129], // Green
            },
            {
              title: 'Balance Due',
              value: `UGX ${summary.totalBalance.toLocaleString()}`,
              subtitle: 'Outstanding',
              color: [239, 68, 68], // Red
            },
          ],
        };

      case 'store-comparison':
        return {
          cards: [
            {
              title: 'Total Revenue',
              value: `UGX ${summary.totalRevenue.toLocaleString()}`,
              subtitle: 'Across all stores',
              color: [16, 185, 129], // Green
            },
            {
              title: 'Total Sales',
              value: summary.totalSales,
              subtitle: 'Transactions',
              color: [79, 70, 229], // Indigo
            },
            {
              title: 'Stores',
              value: summary.storeCount,
              subtitle: 'Compared',
              color: [245, 158, 11], // Amber
            },
          ],
        };

      case 'massage-services':
        return {
          cards: [
            {
              title: 'Total Revenue',
              value: `UGX ${summary.totalRevenue.toLocaleString()}`,
              subtitle: 'Service sales',
              color: [16, 185, 129], // Green
            },
            {
              title: 'Total Sales',
              value: summary.totalSales,
              subtitle: 'Service bookings',
              color: [79, 70, 229], // Indigo
            },
            {
              title: 'Average Sale',
              value: `UGX ${summary.averageSale.toLocaleString()}`,
              subtitle: 'Per service',
              color: [245, 158, 11], // Amber
            },
          ],
        };

      case 'product-performance':
        return {
          cards: [
            {
              title: 'Units Sold',
              value: summary.totalUnitsSold.toLocaleString(),
              subtitle: 'Total quantity',
              color: [16, 185, 129], // Green
            },
            {
              title: 'Total Revenue',
              value: `UGX ${summary.totalRevenue.toLocaleString()}`,
              subtitle: 'Generated',
              color: [79, 70, 229], // Indigo
            },
            {
              title: 'Sales Count',
              value: summary.salesCount,
              subtitle: 'Transactions',
              color: [245, 158, 11], // Amber
            },
            {
              title: 'Stores',
              value: summary.storeCount,
              subtitle: 'Sold in',
              color: [139, 92, 246], // Purple
            },
          ],
        };
    }
  }

  private buildSalesSections(
    reportType: string,
    reportData: any,
  ): ReportSection[] {
    const sections: ReportSection[] = [];

    switch (reportType) {
      case 'daily-sales':
        if (reportData.data.sales.length > 0) {
          sections.push({
            title: 'Sales Transactions',
            type: 'table',
            data: reportData.data.sales,
            columns: [
              {
                header: 'Time',
                key: 'createdAt',
                width: 100,
                format: (value) => new Date(value).toLocaleTimeString(),
              },
              {
                header: 'Client',
                key: 'client',
                width: 120,
                format: (client) =>
                  client ? `${client.firstName} ${client.lastName}` : 'Walk-in',
              },
              {
                header: 'Employee',
                key: 'employee',
                width: 120,
                format: (employee) =>
                  `${employee.firstName} ${employee.lastName}`,
              },
              {
                header: 'Amount',
                key: 'total',
                width: 100,
                align: 'right',
                format: (value) => `UGX ${Number(value).toLocaleString()}`,
              },
              {
                header: 'Status',
                key: 'status',
                width: 80,
                align: 'center',
              },
              {
                header: 'Balance',
                key: 'balance',
                width: 100,
                align: 'right',
                format: (value) => `UGX ${Number(value).toLocaleString()}`,
              },
            ],
          });
        }
        break;

      case 'period-sales':
        if (reportData.data.dailyBreakdown.length > 0) {
          sections.push({
            title: 'Daily Breakdown',
            type: 'table',
            data: reportData.data.dailyBreakdown,
            columns: [
              { header: 'Date', key: 'date', width: 100 },
              {
                header: 'Revenue',
                key: 'revenue',
                width: 120,
                align: 'right',
                format: (value) => `UGX ${Number(value).toLocaleString()}`,
              },
              {
                header: 'Sales Count',
                key: 'salesCount',
                width: 100,
                align: 'center',
              },
              {
                header: 'Paid Amount',
                key: 'paidAmount',
                width: 120,
                align: 'right',
                format: (value) => `UGX ${Number(value).toLocaleString()}`,
              },
            ],
          });
        }
        break;

      case 'store-comparison':
        if (reportData.data.stores.length > 0) {
          sections.push({
            title: 'Store Performance',
            type: 'table',
            data: reportData.data.stores,
            columns: [
              { header: 'Store Name', key: 'name', width: 150 },
              {
                header: 'Total Revenue',
                key: 'totalRevenue',
                width: 120,
                align: 'right',
                format: (value) => `UGX ${Number(value).toLocaleString()}`,
              },
              {
                header: 'Sales Count',
                key: 'salesCount',
                width: 100,
                align: 'center',
              },
              {
                header: 'Revenue Share',
                key: 'revenueShare',
                width: 100,
                align: 'right',
                format: (value) => `${Number(value).toFixed(1)}%`,
              },
            ],
          });
        }
        break;

      case 'massage-services':
        if (reportData.data.servicePerformance.length > 0) {
          sections.push({
            title: 'Service Performance',
            type: 'table',
            data: reportData.data.servicePerformance,
            columns: [
              { header: 'Service Name', key: 'name', width: 150 },
              {
                header: 'Price',
                key: 'price',
                width: 100,
                align: 'right',
                format: (value) => `UGX ${Number(value).toLocaleString()}`,
              },
              {
                header: 'Total Revenue',
                key: 'totalRevenue',
                width: 120,
                align: 'right',
                format: (value) => `UGX ${Number(value).toLocaleString()}`,
              },
              {
                header: 'Sales Count',
                key: 'salesCount',
                width: 100,
                align: 'center',
              },
            ],
          });
        }
        break;

      case 'product-performance':
        if (reportData.data.sales.length > 0) {
          sections.push({
            title: 'Product Sales History',
            type: 'table',
            data: reportData.data.sales,
            columns: [
              {
                header: 'Date',
                key: 'date',
                width: 100,
                format: (value) => new Date(value).toLocaleDateString(),
              },
              { header: 'Store', key: 'store', width: 120 },
              {
                header: 'Quantity',
                key: 'quantity',
                width: 80,
                align: 'center',
              },
              {
                header: 'Price',
                key: 'price',
                width: 100,
                align: 'right',
                format: (value) => `UGX ${Number(value).toLocaleString()}`,
              },
              {
                header: 'Total',
                key: 'total',
                width: 100,
                align: 'right',
                format: (value) => `UGX ${Number(value).toLocaleString()}`,
              },
            ],
          });
        }
        break;
    }

    return sections;
  }

  private generateSalesFilename(
    reportType: string,
    filters: any,
    reportData: any,
  ): string {
    const baseName = `sales-${reportType.replace('-', '-')}`;
    const date = new Date().toISOString().split('T')[0];

    switch (reportType) {
      case 'daily-sales':
        const dailyDate =
          filters.date || new Date().toISOString().split('T')[0];
        return `${baseName}-${dailyDate}.pdf`;

      case 'period-sales':
        const periodRange =
          filters.startDate && filters.endDate
            ? `${filters.startDate}-to-${filters.endDate}`
            : 'all-period';
        return `${baseName}-${periodRange}-${date}.pdf`;

      case 'store-comparison':
        const comparisonRange =
          filters.startDate && filters.endDate
            ? `${filters.startDate}-to-${filters.endDate}`
            : 'all-time';
        return `${baseName}-${comparisonRange}-${date}.pdf`;

      case 'massage-services':
        const serviceRange =
          filters.startDate && filters.endDate
            ? `${filters.startDate}-to-${filters.endDate}`
            : 'all-time';
        return `${baseName}-${serviceRange}-${date}.pdf`;

      case 'product-performance':
        const productName =
          reportData.data.product?.name?.replace(/\s+/g, '-') || filters.itemId;
        const productRange =
          filters.startDate && filters.endDate
            ? `${filters.startDate}-to-${filters.endDate}`
            : 'all-time';
        return `${baseName}-${productName}-${productRange}-${date}.pdf`;

      default:
        return `${baseName}-${date}.pdf`;
    }
  }

  //HR reports
  async employeeAttendance() {
    // TODO: Implement employee attendance
  }

  async payrollHistory() {
    // TODO: Implement payroll history
  }

  //Expense reports
  async expenseByCategory(
    branchId?: string,
    category?: string,
    startDate?: string,
    endDate?: string,
  ) {
    try {
      // TODO: Implement expense by category
      const where: Prisma.branchExpenseWhereInput = {};

      if (branchId) where.branchId = branchId;
      if (category) where.category = category as ExpenseCategory; // ExpenseCategory enum
      if (startDate || endDate) {
        where.dateIncurred = {};
        if (startDate) where.dateIncurred.gte = new Date(startDate);
        if (endDate) {
          const end = new Date(endDate);
          end.setDate(end.getDate() + 1); // include the whole end day
          where.dateIncurred.lt = end;
        }
      }

      // Group and aggregate by category
      const groupedExpenses = await this.prisma.branchExpense.groupBy({
        by: ['category'],
        _sum: { amount: true },
        _count: { _all: true },
        where,
      });

      // Fetch detailed records
      const detailedExpenses = await this.prisma.branchExpense.findMany({
        where,
        include: {
          employee: { select: { firstName: true, lastName: true } },
          branch: { select: { name: true } },
        },
        orderBy: { dateIncurred: 'desc' },
      });

      // Combine both sets
      const result = groupedExpenses.map((group) => ({
        category: group.category,
        totalAmount: group._sum.amount ?? 0,
        expenseCount: group._count._all,
        expenses: detailedExpenses.filter((e) => e.category === group.category),
      }));

      return {
        totalCategories: result.length,
        totalAmount: result.reduce((sum, r) => sum + r.totalAmount, 0),
        data: result,
      };
    } catch (error) {
      console.error('Error fetching expense by category:', error);
      throw new Error('Failed to fetch expenses by category');
    }
  }

  async exportExpenseReportPDF(
    branchId?: string,
    category?: string,
    startDate?: string,
    endDate?: string,
  ) {
    // 1️⃣ Fetch expense data
    const reportData = await this.expenseByCategory(
      branchId,
      category,
      startDate,
      endDate,
    );
    const companyInfo = await this.companyService.getProfile();

    // 2️⃣ Fetch branch info
    let branch: any = null;
    if (branchId) {
      branch = await this.prisma.branch.findUnique({ where: { id: branchId } });
      if (!branch)
        throw new NotFoundException(`Branch with ID ${branchId} not found`);
    }

    if (!companyInfo) {
      throw new NotFoundException('Company profile not found');
    }

    // 3️⃣ Destructure data
    const { totalCategories, totalAmount, data } = reportData;

    // 4️⃣ Build filters
    const filters: Record<string, string> = {
      Branch: branch?.name || 'All Branches',
      'Generated Date': new Date().toLocaleDateString('en-GB'),
    };

    if (category) filters['Category'] = category;
    if (startDate)
      filters['Start Date'] = new Date(startDate).toLocaleDateString();
    if (endDate) filters['End Date'] = new Date(endDate).toLocaleDateString();

    // 5️⃣ Prepare summary cards
    const summaryCards = [
      {
        title: 'Total Categories',
        value: totalCategories,
        subtitle: 'groups',
        color: [13, 148, 136], // teal
      },
      {
        title: 'Total Amount',
        value: totalAmount.toLocaleString() + ' UGX',
        subtitle: 'sum of all expenses',
        color: [37, 99, 235], // blue
      },
      {
        title: 'Report Generated On',
        value: new Date().toLocaleDateString('en-GB'),
        subtitle: '',
        color: [234, 179, 8], // yellow
      },
    ];

    // 6️⃣ Prepare detailed sections
    const sections: ReportSection[] = data.map((cat) => ({
      title: `${cat.category} — ${cat.expenseCount} expense(s)`,
      type: 'table',
      data: cat.expenses.map((exp) => ({
        title: exp.title,
        amount: exp.amount.toLocaleString() + ' UGX',
        date: new Date(exp.dateIncurred).toLocaleDateString('en-GB'),
        recordedBy: `${exp.employee.firstName} ${exp.employee.lastName}`,
        branch: exp.branch.name,
      })),
      columns: [
        { header: 'Title', key: 'title', width: 120 },
        { header: 'Amount (UGX)', key: 'amount', width: 100, align: 'right' },
        { header: 'Date Incurred', key: 'date', width: 100 },
        { header: 'Recorded By', key: 'recordedBy', width: 100 },
        { header: 'Branch', key: 'branch', width: 100 },
      ],
    }));

    // 7️⃣ Build report configuration
    const config: ReportConfig = {
      title: 'Expenses Report',
      subtitle: branch ? `Branch: ${branch.name}` : 'All Branches',
      filters,
      summary: { cards: summaryCards },
      sections,
      companyInfo,
    };

    // 8️⃣ Generate PDF
    const pdfBuffer = await this.pdfService.generateReportPDF(config);

    // 9️⃣ Build file name dynamically
    let filename = `expenses-report-${branch?.name?.replace(/\s+/g, '-') || 'all-branches'}`;

    if (startDate && endDate) {
      const start = new Date(startDate).toISOString().split('T')[0];
      const end = new Date(endDate).toISOString().split('T')[0];
      filename += `-${start}-to-${end}`;
    } else if (startDate) {
      filename += `-from-${new Date(startDate).toISOString().split('T')[0]}`;
    } else if (endDate) {
      filename += `-until-${new Date(endDate).toISOString().split('T')[0]}`;
    } else {
      filename += `-${new Date().toISOString().split('T')[0]}`;
    }

    if (category) {
      filename += `-${category.toLowerCase().replace(/\s+/g, '-')}`;
    }

    filename += '.pdf';

    // 🔟 Return formatted response
    return {
      buffer: pdfBuffer,
      filename,
      mimeType: 'application/pdf',
    };
  }

  //Exhibition reports
  // Exhibition reports - Simplified sales and revenue comparison
  async exhibitionRevenueComparison(exhibitionIds?: string[]) {
    return {
      status: 200,
      data: {
        exhibitions: [],
        summary: {
          totalRevenue: 0,
          totalSales: 0,
          exhibitionCount: 0,
        },
      },
      message:
        'Exhibition revenue comparison is not available for the current schema.',
    };
  }

  async exhibitionSalesSummary(expoId?: number) {
    return {
      status: 200,
      data: {
        sales: [],
        summary: {
          totalAmount: 0,
          totalSales: 0,
        },
        exhibition: null,
      },
      message:
        'Exhibition sales summary is not available for the current schema.',
    };
  }

  async exhibitionExpensesSummary(expoId?: number) {
    return {
      status: 200,
      data: {
        expenses: [],
        summary: {
          totalExpenses: 0,
          totalExpenseCount: 0,
          expensesByCategory: [],
        },
        exhibition: null,
      },
      message:
        'Exhibition expenses summary is not available for the current schema.',
    };
  }

  async exportExhibitionReportToPDF(
    reportType: 'revenue-comparison' | 'sales-summary' | 'expenses-summary',
    filters: {
      exhibitionIds?: string[];
      expoId?: number;
    },
  ) {
    let reportData: any;
    let title = '';
    let subtitle = '';

    // Fetch the appropriate report data
    switch (reportType) {
      case 'revenue-comparison':
        reportData = await this.exhibitionRevenueComparison(
          filters.exhibitionIds,
        );
        title = 'Exhibition Revenue Comparison Report';
        subtitle =
          filters.exhibitionIds && filters.exhibitionIds.length > 0
            ? `Comparing ${filters.exhibitionIds.length} Exhibitions`
            : 'All Exhibitions';
        break;

      case 'sales-summary':
        reportData = await this.exhibitionSalesSummary(filters.expoId);
        title = 'Exhibition Sales Summary Report';
        subtitle = reportData.data.exhibition
          ? `Exhibition: ${reportData.data.exhibition.name}`
          : 'All Exhibitions';
        break;

      case 'expenses-summary':
        reportData = await this.exhibitionExpensesSummary(filters.expoId);
        title = 'Exhibition Expenses Summary Report';
        subtitle = reportData.data.exhibition
          ? `Exhibition: ${reportData.data.exhibition.name}`
          : 'All Exhibitions';
        break;
    }

    const companyInfo = await this.companyService.getProfile();

    if (!companyInfo) {
      throw new NotFoundException('Company profile not found');
    }

    // Build report configuration based on report type
    const config: ReportConfig = {
      title,
      subtitle,
      filters: this.buildExhibitionFilters(reportType, filters, reportData),
      companyInfo,
      sections: this.buildExhibitionSections(reportType, reportData),
    };

    // Add summary section for all report types
    if (reportData.data.summary) {
      config.summary = this.buildExhibitionSummary(
        reportType,
        reportData.data.summary,
      );
    }

    const pdfBuffer = await this.pdfService.generateReportPDF(config);

    // Generate filename
    const filename = this.generateExhibitionFilename(
      reportType,
      filters,
      reportData,
    );

    return {
      buffer: pdfBuffer,
      filename,
      mimeType: 'application/pdf',
    };
  }

  private buildExhibitionFilters(
    reportType: string,
    filters: any,
    reportData: any,
  ): Record<string, any> {
    const filterDescriptions: Record<string, any> = {
      'Report Type': reportType.replace('-', ' ').toUpperCase(),
      'Generated Date': new Date().toLocaleDateString(),
    };

    switch (reportType) {
      case 'revenue-comparison':
        if (filters.exhibitionIds && filters.exhibitionIds.length > 0) {
          filterDescriptions['Exhibitions Compared'] =
            filters.exhibitionIds.length;
        } else {
          filterDescriptions['Scope'] = 'All Exhibitions';
        }
        break;

      case 'sales-summary':
      case 'expenses-summary':
        if (filters.expoId && reportData.data.exhibition) {
          filterDescriptions['Exhibition'] = reportData.data.exhibition.name;
        } else {
          filterDescriptions['Scope'] = 'All Exhibitions';
        }
        break;
    }

    return filterDescriptions;
  }

  private buildExhibitionSummary(reportType: string, summary: any): any {
    switch (reportType) {
      case 'revenue-comparison':
        return {
          cards: [
            {
              title: 'Total Revenue',
              value: `UGX ${summary.totalRevenue.toLocaleString()}`,
              subtitle: 'Across all exhibitions',
              color: [79, 70, 229], // Indigo
            },
            {
              title: 'Total Sales',
              value: summary.totalSales,
              subtitle: 'Transactions',
              color: [16, 185, 129], // Green
            },
            {
              title: 'Exhibitions',
              value: summary.exhibitionCount,
              subtitle: 'Compared',
              color: [245, 158, 11], // Amber
            },
          ],
        };

      case 'sales-summary':
        return {
          cards: [
            {
              title: 'Total Revenue',
              value: `UGX ${summary.totalAmount.toLocaleString()}`,
              subtitle: 'Gross sales',
              color: [16, 185, 129], // Green
            },
            {
              title: 'Total Sales',
              value: summary.totalSales,
              subtitle: 'Transactions',
              color: [79, 70, 229], // Indigo
            },
          ],
        };

      case 'expenses-summary':
        return {
          cards: [
            {
              title: 'Total Expenses',
              value: `UGX ${summary.totalExpenses.toLocaleString()}`,
              subtitle: 'Total spent',
              color: [239, 68, 68], // Red
            },
            {
              title: 'Expense Items',
              value: summary.totalExpenseCount,
              subtitle: 'Records',
              color: [245, 158, 11], // Amber
            },
            {
              title: 'Categories',
              value: summary.expensesByCategory.length,
              subtitle: 'Expense types',
              color: [79, 70, 229], // Indigo
            },
          ],
        };
    }
  }

  private buildExhibitionSections(
    reportType: string,
    reportData: any,
  ): ReportSection[] {
    const sections: ReportSection[] = [];

    switch (reportType) {
      case 'revenue-comparison':
        if (reportData.data.exhibitions.length > 0) {
          sections.push({
            title: 'Exhibition Revenue Comparison',
            type: 'table',
            data: reportData.data.exhibitions,
            columns: [
              { header: 'Exhibition Name', key: 'name', width: 150 },
              {
                header: 'Total Revenue',
                key: 'totalRevenue',
                width: 120,
                align: 'right',
                format: (value) => `UGX ${Number(value).toLocaleString()}`,
              },
              {
                header: 'Sales Count',
                key: 'salesCount',
                width: 100,
                align: 'center',
              },
            ],
          });
        }
        break;

      case 'sales-summary':
        if (reportData.data.sales.length > 0) {
          sections.push({
            title: 'Sales Details',
            type: 'table',
            data: reportData.data.sales,
            columns: [
              {
                header: 'Date',
                key: 'createdAt',
                width: 100,
                format: (value) => new Date(value).toLocaleDateString(),
              },
              {
                header: 'Client',
                key: 'client',
                width: 120,
                format: (client) =>
                  client ? `${client.firstName} ${client.lastName}` : 'N/A',
              },
              {
                header: 'Amount',
                key: 'total',
                width: 100,
                align: 'right',
                format: (value) => `UGX ${Number(value).toLocaleString()}`,
              },
              {
                header: 'Status',
                key: 'status',
                width: 80,
                align: 'center',
              },
              {
                header: 'Balance',
                key: 'balance',
                width: 100,
                align: 'right',
                format: (value) => `UGX ${Number(value).toLocaleString()}`,
              },
            ],
          });
        }
        break;

      case 'expenses-summary':
        // Expenses by category section
        if (reportData.data.summary.expensesByCategory.length > 0) {
          sections.push({
            title: 'Expenses by Category',
            type: 'table',
            data: reportData.data.summary.expensesByCategory,
            columns: [
              { header: 'Category', key: 'category', width: 120 },
              {
                header: 'Total Amount',
                key: 'totalAmount',
                width: 120,
                align: 'right',
                format: (value) => `UGX ${Number(value).toLocaleString()}`,
              },
              {
                header: 'Count',
                key: 'count',
                width: 80,
                align: 'center',
              },
            ],
          });
        }

        // Detailed expenses section
        if (reportData.data.expenses.length > 0) {
          sections.push({
            title: 'Expense Details',
            type: 'table',
            data: reportData.data.expenses,
            columns: [
              {
                header: 'Date',
                key: 'dateIncurred',
                width: 100,
                format: (value) => new Date(value).toLocaleDateString(),
              },
              { header: 'Title', key: 'title', width: 120 },
              { header: 'Category', key: 'category', width: 100 },
              {
                header: 'Amount',
                key: 'amount',
                width: 100,
                align: 'right',
                format: (value) => `UGX ${Number(value).toLocaleString()}`,
              },
              {
                header: 'Description',
                key: 'description',
                width: 150,
                format: (desc) => desc || '-',
              },
            ],
          });
        }
        break;
    }

    return sections;
  }

  private generateExhibitionFilename(
    reportType: string,
    filters: any,
    reportData: any,
  ): string {
    const baseName = `exhibition-${reportType}`;
    const date = new Date().toISOString().split('T')[0];

    switch (reportType) {
      case 'revenue-comparison':
        if (filters.exhibitionIds && filters.exhibitionIds.length > 0) {
          return `${baseName}-${filters.exhibitionIds.length}-exhibitions-${date}.pdf`;
        }
        return `${baseName}-all-exhibitions-${date}.pdf`;

      case 'sales-summary':
      case 'expenses-summary':
        if (filters.expoId && reportData.data.exhibition) {
          const exhibitionName = reportData.data.exhibition.name.replace(
            /\s+/g,
            '-',
          );
          return `${baseName}-${exhibitionName}-${date}.pdf`;
        }
        return `${baseName}-all-exhibitions-${date}.pdf`;

      default:
        return `${baseName}-${date}.pdf`;
    }
  }
}
