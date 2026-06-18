import {
  Body,
  Controller,
  Post,
  Get,
  UseInterceptors,
  UploadedFiles,
  Param,
} from '@nestjs/common';
import {
  ConfirmStockMovementDto,
  CreateDeliveryNoteDto,
  CreateStockMovementDto,
  RejectStockMovementDto,
} from 'src/dto/stockMovement.dto';
import { StockMovementService } from './stockMovement.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join, extname } from 'path';
import { DeliveryNoteService } from './deliveryNotes.service';
@Controller('api/stock-movement')
export class StockMovementController {
  constructor(
    private readonly stockMovementService: StockMovementService,
    private readonly DeliveryNoteService: DeliveryNoteService,
  ) {}

  @Post('create')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads/evidence'),
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `mvt-${uniqueSuffix}${ext}`);
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
  async create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: CreateStockMovementDto,
  ) {
    console.log(dto);
    return this.stockMovementService.create(files, dto);
  }

  @Post('confirm-transfer')
  async confirm(@Body() dto: ConfirmStockMovementDto) {
    return this.stockMovementService.confirmStockTransfer(dto);
  }

  @Post('reject-transfer')
  async reject(@Body() dto: RejectStockMovementDto) {
    return this.stockMovementService.rejectStockTransfer(dto);
  }

  @Get('fetch-all')
  async fetchAll() {
    return this.stockMovementService.getAllStockMovementRecords();
  }

  @Post('delivery-note/create')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads/dns'),
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `dn-${uniqueSuffix}${ext}`);
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
  async createDeliveryNote(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: CreateDeliveryNoteDto,
  ) {
    return this.DeliveryNoteService.create(files, dto);
  }

  @Post('resolve-stock-transfer-conflict/:id')
  async resolveConflict(
    @Param('id') id: string,
    @Body() dto: { notes: string },
  ) {
    return this.stockMovementService.resolveStockMvtConflict(id, dto.notes);
  }

  @Post('delete-dn/:id')
  async deleteDn(@Param('id') id: string) {
    return this.DeliveryNoteService.deleteDeliveryNotes(id);
  }

  @Get('fetch-all-dns')
  async fetchAllDeliveryNotes() {
    return this.DeliveryNoteService.getAllDeliveryNotes();
  }
}
