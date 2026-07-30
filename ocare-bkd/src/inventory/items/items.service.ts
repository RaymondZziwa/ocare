import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateEAN13 } from 'src/utils/barcodeGenerator';
import { GenericResponse } from 'src/utils/genericResponse';

@Injectable()
export class ItemService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: {
    categoryId: string;
    name: string;
    price: number; // Note: Ensure you remove this or map it if needed, it's not in the schema
    brandId: string;
    buyingPrice: number;
    sellingPrice: number;
    alertStockLevel?: number;
    unitId: string;
    image: string;
    description: string;
    showInPos: boolean;
    variation?: any;
    sideEffects?: any;
  }): Promise<GenericResponse> {
    // Generate barcode
    const barcode = generateEAN13();

    // Helper function to safely handle JSON strings or arrays
    const parseJsonField = (field: any) => {
      if (!field) return [];
      if (typeof field === 'string') {
        try {
          return JSON.parse(field);
        } catch {
          return [];
        }
      }
      return field;
    };

    // Explicitly destruct and separate fields to prevent leaking 'price' into Prisma
    const {
      categoryId,
      name,
      brandId,
      buyingPrice,
      sellingPrice,
      alertStockLevel,
      unitId,
      image,
      description,
      showInPos,
      variation,
      sideEffects,
    } = data;

    const item = await this.prismaService.item.create({
      data: {
        name,
        buyingPrice,
        sellingPrice,
        image,
        description: description || '', // Protects against null violations
        showInPos: showInPos ?? false,
        barcode,
        alertStockLevel: alertStockLevel || 0,

        // Pass clean, parsed JSON values
        variation: parseJsonField(variation),
        sideEffects: parseJsonField(sideEffects),

        // Use explicit relational connections to satisfy Prisma constraints
        category: { connect: { id: categoryId } },
        brand: { connect: { id: brandId } },
        unit: { connect: { id: unitId } },
      },
    });

    return {
      status: 200,
      data: item,
      message: 'Item created successfully',
    };
  }

  async findAll(): Promise<GenericResponse> {
    const items = await this.prismaService.item.findMany({
      include: {
        category: true,
        unit: true,
        brand: true,
        //ItemReview: true,
      },
    });
    return {
      status: 200,
      data: items,
      message: 'Items fetched successfully',
    };
  }

  async findAllWithStoreQuantity(storeId: string): Promise<GenericResponse> {
    const store = await this.prismaService.store.findUnique({
      where: { id: storeId },
    });
    if (!store) {
      return {
        status: 404,
        data: [],
        message: 'Store not found',
      };
    }

    const items = await this.prismaService.productInventory.findMany({
      where: { storeId },
      include: {
        item: {
          include: {
            category: true,
          },
        },
        store: true,
        unit: true,
      },
    });

    return {
      status: 200,
      data: items,
      message: 'Selected store inventory fetched successfully',
    };
  }

  async findOne(id: string): Promise<GenericResponse> {
    const item = await this.prismaService.item.findUnique({
      where: { id },
    });
    return {
      status: 200,
      data: item,
      message: 'Item fetched successfully',
    };
  }

  async update(
    id: string,
    data: {
      categoryId?: string;
      name?: string;
      price?: number;
      brandId?: string;
      buyingPrice?: number;
      sellingPrice?: number;
      unitId?: string;
      image?: string;
      description?: string;
      showInPos?: boolean;
      barcode?: string;
      barcodeType?: string;
      alertStockLevel?: number;
      variation?: any[];
      sideEffects?: any[];
    },
  ): Promise<GenericResponse> {
    const updateData: any = {};

    // Only add fields that are provided
    if (data.name !== undefined) updateData.name = data.name;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.buyingPrice !== undefined)
      updateData.buyingPrice = data.buyingPrice;
    if (data.sellingPrice !== undefined)
      updateData.sellingPrice = data.sellingPrice;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.showInPos !== undefined) updateData.showInPos = data.showInPos;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.barcode !== undefined) updateData.barcode = data.barcode;
    if (data.barcodeType !== undefined)
      updateData.barcodeType = data.barcodeType;
    if (data.alertStockLevel !== undefined)
      updateData.alertStockLevel = data.alertStockLevel;
    if (data.variation !== undefined) updateData.variation = data.variation;
    if (data.sideEffects !== undefined)
      updateData.sideEffects = data.sideEffects;
    updateData.updatedAt = new Date();

    // Validate and add categoryId
    if (data.categoryId) {
      const categoryExists = await this.prismaService.itemCategory.findUnique({
        where: { id: data.categoryId },
      });

      if (!categoryExists) {
        throw new BadRequestException('Invalid category');
      }

      updateData.categoryId = data.categoryId;
    }

    // Validate and add brandId
    if (data.brandId) {
      const brandExists = await this.prismaService.brand.findUnique({
        where: { id: data.brandId },
      });

      if (!brandExists) {
        throw new BadRequestException('Invalid brand');
      }

      updateData.brandId = data.brandId;
    }

    // Validate and add unitId
    if (data.unitId) {
      const unitExists = await this.prismaService.unit.findUnique({
        where: { id: data.unitId },
      });

      if (!unitExists) {
        throw new BadRequestException('Invalid unit');
      }

      updateData.unitId = data.unitId;
    }

    // Check if item exists before updating
    const existingItem = await this.prismaService.item.findUnique({
      where: { id },
    });

    if (!existingItem) {
      throw new BadRequestException('Item not found');
    }

    const item = await this.prismaService.item.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        brand: true,
        unit: true,
      },
    });

    return {
      status: 200,
      data: item,
      message: 'Item modified successfully',
    };
  }

  async remove(id: string): Promise<GenericResponse> {
    const item = await this.prismaService.item.delete({
      where: { id },
    });
    return {
      status: 200,
      data: item,
      message: 'Item deleted successfully',
    };
  }
}
