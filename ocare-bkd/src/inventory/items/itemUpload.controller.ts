// src/items/items.controller.ts
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ItemService } from './items.service';
//import { parseExcelForItems } from 'src/utils/excelHelper';

@Controller('api/items')
export class ItemUploadController {
  constructor(private readonly itemsService: ItemService) {}

  // @Post('upload')
  // @HttpCode(HttpStatus.CREATED)
  // @UseInterceptors(FileInterceptor('file'))
  // async uploadItems(@UploadedFile() file: Express.Multer.File) {
  //   // 1. Validate file exists
  //   if (!file) {
  //     throw new BadRequestException('No file uploaded');
  //   }

  //   // 2. Validate file type
  //   const allowedMimeTypes = [
  //     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  //     'application/vnd.ms-excel', // .xls
  //   ];
  //   if (!allowedMimeTypes.includes(file.mimetype)) {
  //     throw new BadRequestException(
  //       'Invalid file format. Please upload an Excel file (.xlsx or .xls)'
  //     );
  //   }

  //   // 3. Parse Excel
  //   try {
  //     const rows = parseExcelForItems(file.buffer);
      
  //     if (rows.length === 0) {
  //       throw new BadRequestException('Excel file is empty or contains no valid rows');
  //     }

  //     // 4. Import items
  //     const result = await this.itemsService.importItemsFromExcelRows(rows);

  //     // 5. Return response
  //     return {
  //       statusCode: HttpStatus.CREATED,
  //       message: `${result.importedCount} items imported successfully`,
  //       importedCount: result.importedCount,
  //       totalRows: result.totalRows,
  //       errors: result.errors.length > 0 ? result.errors : undefined,
  //     };
  //   } catch (error) {
  //     throw new BadRequestException(
  //       `Failed to process Excel file: ${error.message}`
  //     );
  //   }
  // }
}