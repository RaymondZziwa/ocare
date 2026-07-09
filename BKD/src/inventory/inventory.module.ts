import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ItemCategoryController } from './itemCategories/itemCategories.controller';
import { ItemCategoryService } from './itemCategories/itemCateogries.service';
import { ItemController } from './items/items.controller';
import { ItemService } from './items/items.service';
import { ServicesController } from './services/services.controller';
import { MservicesService } from './services/services.service';
import { StoreService } from './stores/stores.service';
import { StoresController } from './stores/stores.controller';
import { MeasurementUnitController } from './units/units.controller';
import { MeasurementUnitService } from './units/units.service';
import { StockMovementController } from './stockMovement/stockMovement.controller';
import { StockMovementService } from './stockMovement/stockMovement.service';
import { DeliveryNoteService } from './stockMovement/deliveryNotes.service';
import { SupplierService } from './supplierManagement/supplierManagement.service';
import { SupplierController } from './supplierManagement/supplierManagement.controller';
import { PdfService } from 'src/utils/pdfGenerator/generator.service';
import { CompanyService } from 'src/company-profile/profile.service';
import { BrandController } from './brands/brand.controller';
import { BrandService } from './brands/brand.service';
import { BannerController } from './banners/banners.controller';
import { BannerService } from './banners/banners.service';

@Module({
  controllers: [
    BrandController,
    ItemCategoryController,
    ItemController,
    ServicesController,
    StoresController,
    MeasurementUnitController,
    StockMovementController,
    SupplierController,
    BannerController,
  ],
  providers: [
    BrandService,
    ItemCategoryService,
    PrismaService,
    ItemService,
    StockMovementService,
    MservicesService,
    StoreService,
    MservicesService,
    MeasurementUnitService,
    DeliveryNoteService,
    SupplierService,
    PdfService,
    CompanyService,
    BannerService,
  ],
})
export class InventoryModule {}
