import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InventoryService } from './import.service';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('import-stock')
  @UseInterceptors(FileInterceptor('file'))
  async importStock(@UploadedFile() file: Express.Multer.File, @Request() req) {
    if (!file) {
      throw new BadRequestException('No file uploaded.');
    }

    // Allowed file types
    const allowedMimes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Only Excel files (.xlsx, .xls) are allowed.',
      );
    }

    // Get employee ID from authenticated user (adjust based on your user structure)
    const employeeId = 'ee6fa238-c2c8-4165-b0da-2827a8e612cc'; // or req.user.employeeId

    // Fixed store ID (you can also pass it as a query param if needed)
    const storeId = 'c6a83ae2-b29e-4d17-8c14-dcc0c53a5aff';

    const result = await this.inventoryService.importStockFromExcel(
      file.buffer,
      storeId,
      employeeId,
    );

    return {
      message: `Imported ${result.imported} out of ${result.total} items.`,
      importedCount: result.imported,
      totalRows: result.total,
      errors: result.errors.length ? result.errors : undefined,
    };
  }
}
