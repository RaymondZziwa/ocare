import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  InventoryRecordCategory,
  Prisma,
  StockTransferStatus,
} from '@prisma/client';
import { CompanyService } from 'src/company-profile/profile.service';
import {
  CreateSupplierDto,
  SupplierPaymentDto,
  UpdateSupplierDto,
} from 'src/dto/supplier.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  PdfService,
  ReportConfig,
} from 'src/utils/pdfGenerator/generator.service';
//import { generateUniqueTransferId } from 'src/utils/stockTransferIdGenerator';

@Injectable()
export class SupplierService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
    private readonly companyService: CompanyService,
  ) {}

  async create(dto: CreateSupplierDto) {
    const supplier = await this.prisma.supplier.create({ data: dto });

    return {
      data: supplier,
      message: 'Supplier created successfullly',
      status: 200,
    };
  }

  async findAll() {
    const suppliers = await this.prisma.supplier.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        Supply: {
          select: {
            id: true,
            SupplyPayments: {
              select: {
                id: true,
                paymentType: true,
                barterItemName: true,
                amount: true,
                bank: true,
                paidBy: true,
                createdAt: true,
                paymentStatus: true,
                proofImage: true,
                employee: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
            item: true,
            uom: true,
            proofImage: true,
            qty: true,
            value: true,
            balance: true,
            destinationStore: true,
            employee: true,
            paymentStatus: true,
            createdAt: true,
          },
        },
      },
    });

    return {
      data: suppliers,
      message: 'Suppliers fetched successfullly',
      status: 200,
    };
  }

  async findOne(id: string) {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } });
    if (!supplier)
      throw new NotFoundException(`Supplier with id ${id} not found`);
    return {
      data: supplier,
      message: 'Supplier fetched successfullly',
      status: 200,
    };
  }

  async update(id: string, dto: UpdateSupplierDto) {
    await this.findOne(id); // ensures it exists
    const supplier = await this.prisma.supplier.update({
      where: { id },
      data: dto,
    });

    return {
      data: supplier,
      message: 'supplier updated successfullly',
      status: 200,
    };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.supplier.delete({ where: { id } });

    return {
      data: [],
      message: 'supplier deleted successfullly',
      status: 200,
    };
  }

  async getSupplierSupplies(id: string) {
    await this.findOne(id);
    const supplies = await this.prisma.supply.findMany({
      where: {
        supplierId: id,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      message: 'Supplier supplies retrieved successfully',
      data: supplies,
      status: 200,
    };
  }

  async createSupply(
    file: Express.Multer.File | null,
    dto: {
      supplierId: string;
      itemId: string;
      qty: number;
      value: number;
      unitId: string;
      recievedBy: string;
      destinationStoreId: string;
    },
  ) {
    const {
      supplierId,
      itemId,
      qty,
      value,
      unitId,
      recievedBy,
      destinationStoreId,
    } = dto;

    const store = await this.prisma.store.findUnique({
      where: { id: destinationStoreId },
    });
    if (!store)
      throw new NotFoundException(
        `Store with id ${destinationStoreId} not found`,
      );

    const authorized = (store.authorizedPersonnel as any[]) || [];
    const authorizedNumbers = authorized.map(id => id);
    if (!authorizedNumbers.includes(recievedBy)) {
      throw new ForbiddenException(
        'You are not authorized to perform operations in this store',
      );
    }

    const item = await this.prisma.item.findUnique({ where: { id: itemId } });
    if (!item) throw new NotFoundException(`Item with id ${itemId} not found`);

    let remainingQuantity = 0;

    let productInventory = await this.prisma.productInventory.findFirst({
      where: { itemId, storeId: destinationStoreId, unitId },
    });

    if (!productInventory) {
      productInventory = await this.prisma.productInventory.create({
        data: {
          itemId,
          storeId: destinationStoreId,
          unitId,
          qty: parseFloat(qty.toString()),
        },
      });
      remainingQuantity = qty;
    } else {
      const newQty =
        parseFloat(productInventory.qty.toString()) +
        parseFloat(qty.toString());
      productInventory = await this.prisma.productInventory.update({
        where: { id: productInventory.id },
        data: { qty: newQty },
      });
      remainingQuantity = newQty;
    }

    await this.prisma.inventoryRecord.create({
      data: {
        itemId,
        storeId: destinationStoreId,
        toStoreId: destinationStoreId,
        unitId,
        category: InventoryRecordCategory.RESTOCK,
        deliveryNoteId: null,
        initiatedQty: parseFloat(qty.toString()),
        qty: parseFloat(qty.toString()),
        remainingQuantity: parseFloat(remainingQuantity.toString()),
        images: [file ? `/uploads/supply-evidence/${file.filename}` : null],
        source: 'SUPPLIER',
        description: 'Supplier supply',
        recordedBy: recievedBy,
        transferStatus: StockTransferStatus.PENDING,
      },
    });

    // create the new supply record
    const supply = await this.prisma.supply.create({
      data: {
        supplierId,
        itemId,
        qty: Number(qty),
        value: new Prisma.Decimal(value),
        balance: new Prisma.Decimal(value),
        unitId,
        recievedBy,
        destinationStoreId,
        proofImage: file ? `/uploads/supply-evidence/${file.filename}` : null,
      },
    });

    return {
      data: supply,
      message: 'Supply created successfully',
      status: 200,
    };
  }

  async modifySupply(id: string, dto: Prisma.SupplyUpdateInput) {
    const existing = await this.prisma.supply.findUnique({ where: { id } });
    if (!existing)
      throw new NotFoundException(`Supply with id ${id} not found`);

    const updated = await this.prisma.supply.update({
      where: { id },
      data: dto,
      include: { item: true, supplier: true, uom: true, employee: true },
    });

    return {
      data: updated,
      message: 'Supply updated successfully',
      status: 200,
    };
  }

  async deleteSupply(id: string) {
    const existing = await this.prisma.supply.findUnique({ where: { id } });
    if (!existing)
      throw new NotFoundException(`Supply with id ${id} not found`);

    await this.prisma.supply.delete({ where: { id } });
    return { data: [], message: 'Supply deleted successfully', status: 200 };
  }

  async processSupplierPayment(
    proofImage: Express.Multer.File | null,
    dto: SupplierPaymentDto,
  ) {
    // 1️⃣ Check supply existence
    const supply = await this.prisma.supply.findUnique({
      where: { id: dto.supplyId },
    });
    if (!supply)
      throw new NotFoundException(`Supply with id ${dto.supplyId} not found`);

    // 2️⃣ Validate payment limit
    if (Number(dto.amount) > Number(supply.balance)) {
      throw new BadRequestException(`Payment amount exceeds remaining balance`);
    }

    // 3️⃣ Compute new balance and payment status
    const newBalance = Number(supply.balance) - Number(dto.amount);
    let newStatus: 'PAID' | 'PARTIALLY_PAID' | 'UNPAID' = 'UNPAID';
    if (newBalance === 0) newStatus = 'PAID';
    else if (newBalance > 0 && Number(dto.amount) > 0)
      newStatus = 'PARTIALLY_PAID';

    // 4️⃣ Construct valid payment data for Prisma
    const paymentData: any = {
      supplyId: dto.supplyId,
      paymentType: dto.paymentType,
      amount: Number(dto.amount),
      paidBy: dto.paidBy,
      paymentStatus: newStatus,
      proofImage: proofImage
        ? `/uploads/supply-payment-evidence/${proofImage.filename}`
        : null,
    };

    // Optional fields
    if (dto.paymentType === 'BARTER_PAYMENT' && dto.barterItemName)
      paymentData.barterItemName = dto.barterItemName;

    if (dto.paymentType === 'CHEQUE') {
      if (dto.chequeNumber) paymentData.chequeNumber = dto.chequeNumber;
      if (dto.chequeBankingDate)
        paymentData.chequeBankingDate = new Date(dto.chequeBankingDate);
      if (dto.bankName) paymentData.bank = dto.bankName; // ✅ correct field name
    }

    // 5️⃣ Save payment record
    const payment = await this.prisma.supplyPayments.create({
      data: paymentData,
      include: { employee: true, supply: true },
    });

    // 6️⃣ Update supply record
    await this.prisma.supply.update({
      where: { id: supply.id },
      data: {
        balance: newBalance,
        paymentStatus: newStatus,
      },
    });

    return {
      data: payment,
      message: 'Supplier payment processed successfully',
      status: 200,
    };
  }

  async modifyPayment(id: string, dto: Prisma.SupplyPaymentsUpdateInput) {
    const existing = await this.prisma.supplyPayments.findUnique({
      where: { id },
    });
    if (!existing)
      throw new NotFoundException(`Payment with id ${id} not found`);

    const updated = await this.prisma.supplyPayments.update({
      where: { id },
      data: dto,
      include: { employee: true, supply: true },
    });

    return {
      data: updated,
      message: 'Supplier payment updated successfully',
      status: 200,
    };
  }

  async deletePayment(id: string) {
    // 1️⃣ Find existing payment
    const existing = await this.prisma.supplyPayments.findUnique({
      where: { id },
      include: { supply: true },
    });

    if (!existing)
      throw new NotFoundException(`Payment with id ${id} not found`);

    const supply = existing.supply;
    if (!supply)
      throw new NotFoundException(
        `Associated supply not found for this payment`,
      );

    // 2️⃣ Restore the balance
    const restoredBalance = Number(supply.balance) + Number(existing.amount);

    // 3️⃣ Recalculate payment status
    let newStatus: 'PAID' | 'PARTIALLY_PAID' | 'UNPAID' = 'UNPAID';

    if (restoredBalance === 0) {
      newStatus = 'PAID';
    } else if (restoredBalance > 0 && restoredBalance < Number(supply.value)) {
      newStatus = 'PARTIALLY_PAID';
    } else if (restoredBalance >= Number(supply.value)) {
      newStatus = 'UNPAID';
    }

    // 4️⃣ Update supply record
    await this.prisma.supply.update({
      where: { id: supply.id },
      data: {
        balance: restoredBalance,
        paymentStatus: newStatus,
      },
    });

    // 5️⃣ Delete payment
    await this.prisma.supplyPayments.delete({ where: { id } });

    return {
      data: [],
      message: 'Supplier payment deleted successfully and balance restored',
      status: 200,
    };
  }

  async getAllSuppliersReport() {
    // 1️⃣ Fetch all suppliers and include related supplies + payments
    const suppliers = await this.prisma.supplier.findMany({
      include: {
        Supply: {
          include: {
            item: true,
            uom: true,
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
            SupplyPayments: {
              include: {
                employee: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // 2️⃣ If no suppliers exist
    if (!suppliers || suppliers.length === 0) {
      return {
        data: {
          suppliers: [],
          summary: {
            totalSuppliers: 0,
            overallTotalSupplied: 0,
            overallTotalPaid: 0,
            overallBalance: 0,
          },
        },
        message: 'No suppliers found in the system',
        status: 200,
      };
    }

    // 3️⃣ Transform suppliers with calculated totals
    const reportData = suppliers.map((supplier) => {
      const totalSupplied = supplier.Supply.reduce(
        (sum, s) => sum + Number(s.value),
        0,
      );

      const totalPaid = supplier.Supply.flatMap((s) => s.SupplyPayments).reduce(
        (sum, p) => sum + Number(p.amount),
        0,
      );

      const balance = totalSupplied - totalPaid;

      // 🧩 Optional: detailed breakdown for each supplier
      const supplyDetails = supplier.Supply.map((s) => ({
        id: s.id,
        itemName: s.item?.name,
        qty: s.qty,
        uom: s.uom?.name,
        value: Number(s.value),
        balance: Number(s.balance),
        paymentStatus: s.paymentStatus,
        receivedBy:
          `${s.employee?.firstName || ''} ${s.employee?.lastName || ''}`.trim(),
        createdAt: s.createdAt,
        payments: s.SupplyPayments.map((p) => ({
          id: p.id,
          paymentType: p.paymentType,
          amount: Number(p.amount),
          paymentStatus: p.paymentStatus,
          proofImage: p.proofImage,
          paidBy:
            `${p.employee?.firstName || ''} ${p.employee?.lastName || ''}`.trim(),
          createdAt: p.createdAt,
          bank: p.bank,
          chequeNumber: p.chequeNumber,
          chequeBankingDate: p.chequeBankingDate,
          barterItemName: p.barterItemName,
        })),
      }));

      return {
        supplierId: supplier.id,
        supplierName: `${supplier.firstName} ${supplier.lastName}`,
        contact: supplier.contact,
        address: supplier.address,
        totalSupplied,
        totalPaid,
        balance,
        supplies: supplyDetails,
      };
    });

    // 4️⃣ Compute overall totals
    const overallTotalSupplied = reportData.reduce(
      (sum, r) => sum + r.totalSupplied,
      0,
    );
    const overallTotalPaid = reportData.reduce(
      (sum, r) => sum + r.totalPaid,
      0,
    );
    const overallBalance = overallTotalSupplied - overallTotalPaid;

    // 5️⃣ Return final result
    return {
      data: {
        suppliers: reportData,
        summary: {
          totalSuppliers: reportData.length,
          overallTotalSupplied,
          overallTotalPaid,
          overallBalance,
        },
      },
      message: 'Supplier report generated successfully',
      status: 200,
    };
  }

  async exportSupplierPayment(id: string) {
    const payments = await this.prisma.supplyPayments.findMany({
      where: { supply: { supplierId: id } },
      include: { employee: true, supply: true },
      orderBy: { createdAt: 'desc' },
    });

    // You could use this result to generate a CSV or PDF export later
    return {
      data: payments,
      message: 'Supplier payments exported successfully',
      status: 200,
    };
  }
  async exportSuppliersReportPDF() {
    // Get report data using your existing method
    const reportResponse = await this.getAllSuppliersReport();
    const companyInfo = await this.companyService.getProfile();

    // Validate required data
    if (!companyInfo) {
      throw new NotFoundException('Company profile not found');
    }

    // Type guard to check if we have the expected data structure
    if (
      !reportResponse.data ||
      typeof reportResponse.data !== 'object' ||
      !('suppliers' in reportResponse.data) ||
      !reportResponse.data.suppliers ||
      reportResponse.data.suppliers.length === 0
    ) {
      throw new NotFoundException('No suppliers data found for export');
    }

    // Convert the data to match the expected types for PDF generation
    const rawData = reportResponse.data as any;

    // Transform the data to match the expected types
    const suppliers = rawData.suppliers.map((supplier: any) => ({
      ...supplier,
      address: supplier.address || '', // Convert null to empty string
      supplies: supplier.supplies.map((supply: any) => ({
        ...supply,
        createdAt:
          supply.createdAt instanceof Date
            ? supply.createdAt.toISOString()
            : String(supply.createdAt),
        payments: supply.payments.map((payment: any) => ({
          ...payment,
          createdAt:
            payment.createdAt instanceof Date
              ? payment.createdAt.toISOString()
              : String(payment.createdAt),
          chequeBankingDate:
            payment.chequeBankingDate instanceof Date
              ? payment.chequeBankingDate.toISOString()
              : payment.chequeBankingDate,
          barterItemName: payment.barterItemName || '', // Ensure barterItemName is never undefined
        })),
      })),
    }));

    const summary = rawData.summary;

    const config: ReportConfig = {
      title: 'Suppliers Summary Report',
      subtitle: 'Complete Supplier Financial Overview',
      filters: {
        'Generated Date': new Date().toLocaleDateString(),
        'Total Suppliers': summary.totalSuppliers.toString(),
      },
      summary: {
        cards: [
          {
            title: 'Total Suppliers',
            value: summary.totalSuppliers,
            subtitle: 'Active suppliers',
            color: [59, 130, 246], // Blue
          },
          {
            title: 'Total Supplied',
            value: `UGX ${summary.overallTotalSupplied.toLocaleString()}`,
            subtitle: 'Goods value',
            color: [34, 197, 94], // Green
          },
          {
            title: 'Total Paid',
            value: `UGX ${summary.overallTotalPaid.toLocaleString()}`,
            subtitle: 'Amount paid',
            color: [20, 184, 166], // Teal
          },
          {
            title: 'Balance Due',
            value: `UGX ${summary.overallBalance.toLocaleString()}`,
            subtitle: 'Outstanding',
            color: [239, 68, 68], // Red
          },
        ],
      },
      sections: [
        {
          title: 'Suppliers Summary',
          type: 'table' as const,
          data: suppliers,
          columns: [
            { header: 'Supplier Name', key: 'supplierName', width: 80 },
            { header: 'Contact', key: 'contact', width: 70 },
            { header: 'Address', key: 'address', width: 60 },
            {
              header: 'Total Supplied',
              key: 'totalSupplied',
              width: 100,
              format: (value: number) => ` ${Number(value).toLocaleString()}`,
            },
            {
              header: 'Total Paid',
              key: 'totalPaid',
              width: 80,
              format: (value: number) => `${Number(value).toLocaleString()}`,
            },
            {
              header: 'Balance',
              key: 'balance',
              width: 60,
              format: (value: number) => `${Number(value).toLocaleString()}`,
            },
            {
              header: 'Status',
              key: 'balance',
              width: 80,
              format: (value: number) =>
                Number(value) > 0 ? 'Has Balance' : 'Settled',
            },
          ],
        },
        // Detailed supplies section for each supplier
        ...suppliers.flatMap((supplier: any) => {
          const sections: any[] = [];

          // Add supply details section
          if (supplier.supplies.length > 0) {
            sections.push({
              title: `${supplier.supplierName} - Supply Details`,
              type: 'table' as const,
              data: supplier.supplies,
              columns: [
                { header: 'Item Name', key: 'itemName', width: 70 },
                {
                  header: 'Qty',
                  key: 'qty',
                  width: 40,
                  align: 'center' as const,
                },
                { header: 'Unit', key: 'uom', width: 80 },
                {
                  header: 'Value',
                  key: 'value',
                  width: 50,
                  format: (value: number) =>
                    `${Number(value).toLocaleString()}`,
                },
                {
                  header: 'Balance',
                  key: 'balance',
                  width: 50,
                  format: (value: number) =>
                    `${Number(value).toLocaleString()}`,
                },
                { header: 'Status', key: 'paymentStatus', width: 80 },
                {
                  header: 'Date',
                  key: 'createdAt',
                  width: 60,
                  format: (value: string) =>
                    new Date(value).toLocaleDateString(),
                },
              ],
            });
          }

          // Add payment sections for each supply
          supplier.supplies.forEach((supply: any) => {
            if (supply.payments.length > 0) {
              sections.push({
                title: `${supply.itemName} - Payments`,
                type: 'table' as const,
                data: supply.payments,
                columns: [
                  { header: 'Payment Type', key: 'paymentType', width: 80 },
                  {
                    header: 'Amount',
                    key: 'amount',
                    width: 45,
                    format: (value: number) =>
                      `${Number(value).toLocaleString()}`,
                  },
                  { header: 'Status', key: 'paymentStatus', width: 80 },
                  { header: 'Paid By', key: 'paidBy', width: 80 },
                  {
                    header: 'Date',
                    key: 'createdAt',
                    width: 80,
                    format: (value: string) =>
                      new Date(value).toLocaleDateString(),
                  },
                  {
                    header: 'Details',
                    key: 'paymentType',
                    width: 70,
                    format: (value: string, payment: any) => {
                      // Safe access to optional properties
                      if (
                        value === 'BARTER_PAYMENT' &&
                        payment?.barterItemName
                      ) {
                        return `Barter: ${payment.barterItemName}`;
                      }
                      if (value === 'CHEQUE' && payment?.chequeNumber) {
                        return `Cheque: ${payment.chequeNumber}`;
                      }
                      return '';
                    },
                  },
                ],
              });
            }
          });

          return sections;
        }),
      ],
      companyInfo,
    };

    const pdfBuffer = await this.pdfService.generateReportPDF(config);

    return {
      buffer: pdfBuffer,
      filename: `suppliers-report-${new Date().toISOString().split('T')[0]}.pdf`,
      mimeType: 'application/pdf',
    };
  }
}
