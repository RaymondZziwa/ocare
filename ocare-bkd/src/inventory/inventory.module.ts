import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ItemCategoryController } from './itemCategories/itemCategories.controller';
import { ItemCategoryService } from './itemCategories/itemCateogries.service';
import { ItemController } from './items/items.controller';
import { ItemService } from './items/items.service';
import { StoreService } from './stores/stores.service';
import { StoresController } from './stores/stores.controller';
import { MeasurementUnitController } from './units/units.controller';
import { MeasurementUnitService } from './units/units.service';
import { StockMovementController } from './stockMovement/stockMovement.controller';
import { StockMovementService } from './stockMovement/stockMovement.service';
// import { DeliveryNoteService } from './stockMovement/deliveryNotes.service';
import { CompanyService } from 'src/company-profile/profile.service';
import { BrandController } from './brands/brand.controller';
import { BrandService } from './brands/brand.service';
import { StockTransferIdGeneratorService } from 'src/utils/stockTransferIdGenerator';

@Module({
  controllers: [
    BrandController,
    ItemCategoryController,
    ItemController,
    StoresController,
    MeasurementUnitController,
    StockMovementController,
  ],
  providers: [
    BrandService,
    ItemCategoryService,
    PrismaService,
    ItemService,
    StockMovementService,
    StoreService,
    MeasurementUnitService,
    //DeliveryNoteService,
    CompanyService,
    StockTransferIdGeneratorService,
  ],
})
export class InventoryModule {}
