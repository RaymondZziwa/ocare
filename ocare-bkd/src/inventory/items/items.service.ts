import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GenericResponse } from 'src/utils/genericResponse';
import { ItemCategoryService } from '../itemCategories/itemCateogries.service';
import { BrandService } from '../brands/brand.service';
// import { ExcelImportRow } from 'src/utils/excelHelper';
import { SkuService } from 'src/utils/skuGenerator.service';

@Injectable()
export class ItemService {
  private readonly DEFAULT_CATEGORY_ID = '4aa4937b-08fc-4025-9343-a556cac181db';
  private readonly DEFAULT_BRAND_ID = '4e2f7d72-d62e-4b6a-b749-0f08f1c5c5d4';
  private readonly DEFAULT_UNIT_ID = '4489cac9-8ed3-4191-9380-906989ce40de';
  constructor(
    private readonly prismaService: PrismaService, // Fallback IDs for when category/brand name is not found
    private categoriesService: ItemCategoryService,
    private brandsService: BrandService,
    private skuService: SkuService,
  ) {}

  async create(data: {
    categoryId: string;
    name: string;
    alertStockLevel?: number;
    unitId: string;
    image: string;
    description: string;
    sku: string;
    showInPos: boolean;
    variation?: any;
    sideEffects?: any;
  }): Promise<GenericResponse> {
    // Generate sku
    const generatedSKU = await this.skuService.generateSKU();
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
      alertStockLevel,
      unitId,
      image,
      description,
      sku,
      showInPos,
      variation,
      sideEffects,
    } = data;

    const item = await this.prismaService.item.create({
      data: {
        name,
        image: image ? image : '',
        description: description || '', // Protects against null violations
        showInPos: showInPos ?? false,
        alertStockLevel: alertStockLevel || 0,
        sku: sku ? sku : generatedSKU,
        // Pass clean, parsed JSON values
        variation: parseJsonField(variation),
        sideEffects: parseJsonField(sideEffects),

        // Use explicit relational connections to satisfy Prisma constraints
        category: { connect: { id: categoryId } },
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
        //ItemReview: true,
      },
    });
    return {
      status: 200,
      data: items,
      message: 'Items fetched successfully',
    };
  }

  async findAllForApp(): Promise<GenericResponse> {
    // Use findFirst because isForAppSales is not a unique field
    const store = await this.prismaService.store.findFirst({
      where: { isForAppSales: true },
    });

    if (!store) {
      return {
        status: 404,
        data: [],
        message: 'Store not found',
      };
    }

    const items = await this.prismaService.productInventory.findMany({
      where: { storeId: store.id }, // or { store: { id: store.id } } if your schema uses nested relations
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
      where: {
        storeId,
        qty: {
          gt: 0,
        },
      },

      include: {
        item: {
          include: {
            category: true,

            batches: {
              include: {
                brand: true,

                batchInventories: {
                  where: {
                    storeId,
                    quantity: {
                      gt: 0,
                    },
                  },

                  include: {
                    store: true,
                  },
                },
              },
              where: {
                expiryDate: {
                  gt: new Date(),
                },
              },
            },
          },
        },

        store: true,
        unit: true,
      },
    });

    console.log('items', items);

    const formattedItems = items.map((product: any) => {
      const batches = product.item?.batches
        ?.map((batch: any) => {
          const inventory = batch.batchInventories?.[0];

          return {
            batchId: batch.id,
            batchNumber: batch.number,
            expiryDate: batch.expiryDate,
            brand: batch.brand?.name,
            buyingPrice: batch.buyingPrice,
            sellingPrice: batch.sellingPrice,
            wholesalePrice: batch.wholesalePrice,
            quantity: inventory?.quantity ?? 0,
          };
        })
        .filter((batch: any) => batch.quantity > 0) || [];

      return {
        id: product.item?.id,
        name: product.item?.name,
        category: product.item?.category,
        unit: product.unit,
        // ProductInventory summary
        totalQuantity: product.qty,
        // Actual sellable batches
        batches,
      };
    });

    return {
      status: 200,
      data: formattedItems,
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
      unitId?: string;
      image?: string;
      description?: string;
      showInPos?: boolean;
      alertStockLevel?: number;
      variation?: any[];
      sideEffects?: any[];
    },
  ): Promise<GenericResponse> {
    const updateData: any = {};

    // Only add fields that are provided
    if (data.name !== undefined) updateData.name = data.name;

    if (data.description !== undefined)
      updateData.description = data.description || '';
    if (data.showInPos !== undefined) updateData.showInPos = data.showInPos;
    if (data.image !== undefined) updateData.image = data.image;

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

  // async importItemsFromExcelRows(rows: ExcelImportRow[]) {
  //   const imported: any[] = [];
  //   const errors: string[] = [];

  //   for (const row of rows) {
  //     try {
  //       if (!row.productName) {
  //         errors.push('Missing product name in row');
  //         continue;
  //       }

  //       let categoryId = this.DEFAULT_CATEGORY_ID;
  //       if (row.categoryName) {
  //         const category = await this.categoriesService.findByName(
  //           row.categoryName,
  //         );
  //         if (category) {
  //           categoryId = category.id;
  //         } else {
  //           errors.push(
  //             `Category "${row.categoryName}" not found for "${row.productName}" – using fallback`,
  //           );
  //         }
  //       }

  //       let brandId = this.DEFAULT_BRAND_ID;
  //       if (row.brandName) {
  //         const brand = await this.brandsService.findByName(row.brandName);
  //         if (brand) {
  //           brandId = brand.id;
  //         } else {
  //           errors.push(
  //             `Brand "${row.brandName}" not found for "${row.productName}" – using fallback`,
  //           );
  //         }
  //       }
  //       const generatedSKU = await this.skuService.generateSKU();
  //       const created = await this.prismaService.item.create({
  //         data: {
  //           name: row.productName,
  //           description: '',
  //           categoryId,
  //           sku: row.sku ? row.sku : generatedSKU,
  //           unitId: this.DEFAULT_UNIT_ID,
  //           alertStockLevel: row.alertStockLevel ?? 0,
  //           showInPos: true,
  //           image: '',
  //           sideEffects: '',
  //           variation: '',
  //         },
  //       });

  //       imported.push(created);
  //     } catch (error: any) {
  //       errors.push(`Error importing "${row.productName}": ${error.message}`);
  //     }
  //   }

  //   return {
  //     importedCount: imported.length,
  //     imported,
  //     errors,
  //     totalRows: rows.length,
  //   };
  // }
}
