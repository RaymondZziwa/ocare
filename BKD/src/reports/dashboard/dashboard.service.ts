import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { subDays, startOfDay, endOfDay, format } from 'date-fns';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
  }

  private extractSaleItems(
    items: unknown,
  ): Array<{ name: string; quantity: number }> {
    if (!Array.isArray(items)) return [];

    return items
      .filter((item): item is Record<string, unknown> => this.isRecord(item))
      .map((item) => {
        const name = typeof item.name === 'string' ? item.name : 'Unnamed Item';
        const rawQty = item.quantity;
        const quantity =
          typeof rawQty === 'number' || typeof rawQty === 'string'
            ? Number(rawQty) || 0
            : 0;

        return { name, quantity };
      });
  }

  // --- 1️⃣ SALES POINT DATA ---
  private async getSalesPointData() {
    const sales = await this.prisma.sale.findMany({
      select: {
        total: true,
        store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const storeSalesMap: Record<string, number> = {};
    for (const sale of sales) {
      const storeName = sale.store?.name || 'Unknown';
      storeSalesMap[storeName] =
        (storeSalesMap[storeName] || 0) + Number(sale.total);
    }

    return Object.entries(storeSalesMap).map(([name, sales]) => ({
      name,
      sales: Math.floor(sales),
    }));
  }

  // --- 2️⃣ WEEKLY REVENUE (BAR CHART) ---
  private async getWeeklyRevenue() {
    const today = new Date();
    const days = Array.from({ length: 7 }).map((_, i) => subDays(today, 6 - i));

    const sales = await this.prisma.sale.findMany({
      where: {
        createdAt: {
          gte: startOfDay(subDays(today, 6)),
          lte: endOfDay(today),
        },
      },
      select: { total: true, createdAt: true },
    });

    const revenueMap: Record<string, number> = {};
    for (const sale of sales) {
      const dayLabel = format(sale.createdAt, 'EEE');
      revenueMap[dayLabel] = (revenueMap[dayLabel] || 0) + Number(sale.total);
    }

    return days.map((day) => ({
      day: format(day, 'EEE'),
      revenue: Math.floor(revenueMap[format(day, 'EEE')] || 0),
    }));
  }

  // --- 3️⃣ TOP 5 SELLING ITEMS ---
  private async getTopSellingItems() {
    const sales = await this.prisma.sale.findMany({
      select: { items: true },
    });

    const itemSalesMap: Record<string, number> = {};
    for (const sale of sales) {
      const saleItems = this.extractSaleItems(sale.items);
      for (const { name, quantity } of saleItems) {
        itemSalesMap[name] = (itemSalesMap[name] || 0) + quantity;
      }
    }

    return Object.entries(itemSalesMap)
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }

  // --- 4️⃣ METRIC CARDS (REVENUE, CLIENTS, DAILY SALES, TOP STORE) ---
  private async getMetricCards() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const yearForLastMonth = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Total revenue comparison
    const [currentMonthSales, lastMonthSales] = await Promise.all([
      this.prisma.sale.findMany({
        where: {
          createdAt: {
            gte: new Date(currentYear, currentMonth, 1),
            lt: new Date(currentYear, currentMonth + 1, 1),
          },
        },
        select: { total: true },
      }),
      this.prisma.sale.findMany({
        where: {
          createdAt: {
            gte: new Date(yearForLastMonth, lastMonth, 1),
            lt: new Date(currentYear, currentMonth, 1),
          },
        },
        select: { total: true },
      }),
    ]);

    const currentRevenue = currentMonthSales.reduce(
      (s, a) => s + Number(a.total),
      0,
    );
    const lastRevenue = lastMonthSales.reduce((s, a) => s + Number(a.total), 0);
    const revenueChange =
      lastRevenue === 0
        ? 0
        : ((currentRevenue - lastRevenue) / lastRevenue) * 100;

    // Clients comparison
    const [currentMonthClients, lastMonthClients] = await Promise.all([
      this.prisma.client.count({
        where: {
          createdAt: {
            gte: new Date(currentYear, currentMonth, 1),
            lt: new Date(currentYear, currentMonth + 1, 1),
          },
        },
      }),
      this.prisma.client.count({
        where: {
          createdAt: {
            gte: new Date(yearForLastMonth, lastMonth, 1),
            lt: new Date(currentYear, currentMonth, 1),
          },
        },
      }),
    ]);

    const clientChange =
      lastMonthClients === 0
        ? 0
        : ((currentMonthClients - lastMonthClients) / lastMonthClients) * 100;

    // Daily sales comparison
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const [todaySales, yesterdaySales] = await Promise.all([
      this.prisma.sale.findMany({
        where: {
          createdAt: {
            gte: new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate(),
            ),
            lt: new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate() + 1,
            ),
          },
        },
        select: { total: true },
      }),
      this.prisma.sale.findMany({
        where: {
          createdAt: {
            gte: new Date(
              yesterday.getFullYear(),
              yesterday.getMonth(),
              yesterday.getDate(),
            ),
            lt: new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate(),
            ),
          },
        },
        select: { total: true },
      }),
    ]);

    const todayTotal = todaySales.reduce((s, a) => s + Number(a.total), 0);
    const yesterdayTotal = yesterdaySales.reduce(
      (s, a) => s + Number(a.total),
      0,
    );
    const dailyChange =
      yesterdayTotal === 0
        ? 0
        : ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100;

    // Top store for month
    const monthlySalesByStore = await this.prisma.sale.groupBy({
      by: ['storeId'],
      where: {
        createdAt: {
          gte: new Date(currentYear, currentMonth, 1),
          lt: new Date(currentYear, currentMonth + 1, 1),
        },
      },
      _sum: { total: true },
    });

    let topStore = { storeName: 'N/A', totalSales: 0 };
    if (monthlySalesByStore.length > 0) {
      const best = monthlySalesByStore.reduce((a, b) =>
        (a._sum.total || 0) > (b._sum.total || 0) ? a : b,
      );
      const store = await this.prisma.store.findUnique({
        where: { id: best.storeId },
      });
      topStore = {
        storeName: store?.name || 'N/A',
        totalSales: Number(best._sum?.total) || 0,
      };
    }

    return {
      totalRevenue: {
        value: currentRevenue,
        change: +revenueChange.toFixed(2),
        isPositive: revenueChange >= 0,
      },
      newClients: {
        value: currentMonthClients,
        change: +clientChange.toFixed(2),
        isPositive: clientChange >= 0,
      },
      dailySales: {
        value: todayTotal,
        change: +dailyChange.toFixed(2),
        isPositive: dailyChange >= 0,
      },
      topStore,
    };
  }

  // --- 5️⃣ MAIN WRAPPER FUNCTION ---
  async getDashboardMetrics() {
    const [salesPointData, weeklyRevenue, topSellingItems, metrics] =
      await Promise.all([
        this.getSalesPointData(),
        this.getWeeklyRevenue(),
        this.getTopSellingItems(),
        this.getMetricCards(),
      ]);

    return {
      status: 200,
      message: 'Dashboard data fetched successfully',
      data: {
        salesPointData,
        weeklyRevenue,
        topSellingItems,
        metrics,
      },
    };
  }

  //Other employee dashboard metrics
  async getStoreInventoryMetrics(storeId?: string) {
    const inventory = await this.prisma.productInventory.findMany({
      where: storeId ? { storeId } : {},
      select: {
        qty: true,
        item: {
          select: {
            id: true,
            name: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        unit: {
          select: {
            name: true,
          },
        },
        store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const outOfStockItems = inventory.filter((i) => (i.qty ?? 0) <= 0);
    const lowStockItems = inventory.filter((i) => i.qty > 0 && i.qty <= 20);
    const inStockItems = inventory.filter((i) => i.qty > 20 && i.qty <= 100);
    const overStockedItems = inventory.filter((i) => i.qty > 100);

    const lowStockPreview = [...lowStockItems]
      .sort((a, b) => (a.qty ?? 0) - (b.qty ?? 0))
      .slice(0, 10)
      .map((i) => ({
        itemId: i.item?.id,
        itemName: i.item?.name,
        category: i.item?.category?.name,
        qty: i.qty,
        unit: i.unit?.name,
        storeId: i.store?.id,
        storeName: i.store?.name,
      }));

    const recentInventoryActivity = await this.prisma.inventoryRecord.findMany({
      where: storeId
        ? {
            OR: [{ storeId }, { toStoreId: storeId }],
          }
        : {},
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        category: true,
        qty: true,
        transferStatus: true,
        createdAt: true,
        item: { select: { id: true, name: true } },
        unit: { select: { name: true } },
        store: { select: { id: true, name: true } },
        toStore: { select: { id: true, name: true } },
        employee: { select: { firstName: true, lastName: true } },
      },
    });

    return {
      totalInventoryRecords: inventory.length,
      outOfStockCount: outOfStockItems.length,
      lowStockCount: lowStockItems.length,
      inStockCount: inStockItems.length,
      overStockedCount: overStockedItems.length,
      lowStockItems: lowStockPreview,
      recentInventoryActivity,
    };
  }

  async getStoreSalesMetrics(storeId?: string, days = 7) {
    const today = new Date();
    const start = startOfDay(subDays(today, Math.max(days - 1, 0)));
    const end = endOfDay(today);

    const sales = await this.prisma.sale.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end,
        },
        ...(storeId ? { storeId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        items: true,
        createdAt: true,
        store: { select: { id: true, name: true } },
        employee: { select: { firstName: true, lastName: true } },
        client: { select: { firstName: true, lastName: true } },
      },
    });

    const statusCounts = sales.reduce(
      (acc, s) => {
        const key = s.status;
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const itemSalesMap: Record<string, number> = {};
    let totalItemsSold = 0;
    for (const sale of sales) {
      const saleItems = this.extractSaleItems(sale.items);
      for (const { name, quantity } of saleItems) {
        totalItemsSold += quantity;
        itemSalesMap[name] = (itemSalesMap[name] || 0) + quantity;
      }
    }

    const topItemsByQuantity = Object.entries(itemSalesMap)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 7);

    const recentSales = sales.slice(0, 10).map((s) => {
      const saleItems = this.extractSaleItems(s.items);
      const itemCount = saleItems.reduce((sum, it) => sum + it.quantity, 0);
      const servedBy = `${s.employee?.firstName ?? ''} ${
        s.employee?.lastName ?? ''
      }`.trim();

      return {
        id: s.id,
        status: s.status,
        createdAt: s.createdAt,
        storeId: s.store?.id,
        storeName: s.store?.name,
        servedBy,
        clientName: s.client
          ? `${s.client.firstName ?? ''} ${s.client.lastName ?? ''}`.trim()
          : undefined,
        itemsCount: itemCount,
      };
    });

    return {
      range: {
        startDate: start,
        endDate: end,
        days,
      },
      totalSalesCount: sales.length,
      statusCounts,
      totalItemsSold,
      topItemsByQuantity,
      recentSales,
    };
  }

  async getStoreExpensesMetrics(branchId?: string, days = 30) {
    const today = new Date();
    const start = startOfDay(subDays(today, Math.max(days - 1, 0)));
    const end = endOfDay(today);

    const expenses = await this.prisma.branchExpense.findMany({
      where: {
        dateIncurred: {
          gte: start,
          lte: end,
        },
        ...(branchId ? { branchId } : {}),
      },
      orderBy: { dateIncurred: 'desc' },
      take: 50,
      select: {
        id: true,
        category: true,
        title: true,
        description: true,
        dateIncurred: true,
        createdAt: true,
        branch: { select: { id: true, name: true } },
        employee: { select: { firstName: true, lastName: true } },
      },
    });

    const byCategory = expenses.reduce(
      (acc, e) => {
        const key = e.category;
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const recentExpenses = expenses.slice(0, 10).map((e) => {
      const recordedBy = `${e.employee?.firstName ?? ''} ${
        e.employee?.lastName ?? ''
      }`.trim();

      return {
        id: e.id,
        title: e.title,
        category: e.category,
        dateIncurred: e.dateIncurred,
        branchId: e.branch?.id,
        branchName: e.branch?.name,
        recordedBy,
      };
    });

    return {
      range: {
        startDate: start,
        endDate: end,
        days,
      },
      totalExpenseEntries: expenses.length,
      byCategory,
      recentExpenses,
    };
  }

  async getEmployeeDashboardMetrics(params?: {
    storeId?: string;
    branchId?: string;
    salesDays?: number;
    expenseDays?: number;
  }) {
    const storeId = params?.storeId;
    const branchId = params?.branchId;
    const salesDays = params?.salesDays ?? 7;
    const expenseDays = params?.expenseDays ?? 30;

    const [inventory, sales, expenses] = await Promise.all([
      this.getStoreInventoryMetrics(storeId),
      this.getStoreSalesMetrics(storeId, salesDays),
      this.getStoreExpensesMetrics(branchId, expenseDays),
    ]);

    return {
      status: 200,
      message: 'Employee dashboard data fetched successfully',
      data: {
        inventory,
        sales,
        expenses,
      },
    };
  }
}
