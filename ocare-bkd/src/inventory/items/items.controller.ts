import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ItemService } from './items.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join, extname } from 'path';

@Controller('api/item')
export class ItemController {
  constructor(private readonly itemCategoryService: ItemService) {}

  @Post('create')
  create(
    @Body()
    data: {
      categoryId: string;
      name: string;
      price: number;
      brandId: string;
      buyingPrice: number;
      image: string;
      description: string;
      alertStockLevel?: number;
      unitId: string;
      sellingPrice: number;
      showInPos: boolean;
      variation?: any[];
      sideEffects?: any[];
    },
  ) {
    return this.itemCategoryService.create(data);
  }

  @Get('fetch-all')
  findAll() {
    return this.itemCategoryService.findAll();
  }

  @Get('fetch-store-inventory/:id')
  findAllStoreInventory(@Param('id') id: string) {
    return this.itemCategoryService.findAllWithStoreQuantity(id);
  }

  @Get('fetch/:id')
  findOne(@Param('id') id: string) {
    return this.itemCategoryService.findOne(id);
  }

  @Patch('modify/:id')
  update(
    @Param('id') id: string,
    @Body()
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
  ) {
    return this.itemCategoryService.update(id, data);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.itemCategoryService.remove(id);
  }

  @Post('upload/item-image')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads/items'),
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `item-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          cb(new Error('Only image files are allowed!'), false);
        } else {
          cb(null, true);
        }
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
    }),
  )
  uploadItemImage(@UploadedFiles() files: Express.Multer.File[]) {
    return {
      status: 200,
      data: `/uploads/items/${files[0].filename}`,
      message: 'Item image uploaded successfully',
    };
  }
}
