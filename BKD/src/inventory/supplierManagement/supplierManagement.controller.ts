import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  CreateSupplierDto,
  SupplierPaymentDto,
  UpdateSupplierDto,
} from 'src/dto/supplier.dto';
import { Prisma } from '@prisma/client';
import { SupplierService } from './supplierManagement.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import path, { join, extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Controller('api/suppliers')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Post('save-supplier')
  @HttpCode(HttpStatus.OK)
  async create(@Body() createSupplierDto: CreateSupplierDto) {
    return await this.supplierService.create(createSupplierDto);
  }

  @Get('fetch-suppliers')
  @HttpCode(HttpStatus.OK)
  async findAll() {
    return await this.supplierService.findAll();
  }

  @Get('get-supplier/:id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return await this.supplierService.findOne(id);
  }

  @Put('update/:id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateSupplierDto: UpdateSupplierDto,
  ) {
    return await this.supplierService.update(id, updateSupplierDto);
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return await this.supplierService.remove(id);
  }

  // ✅ FIXED SUPPLY CREATION WITH FILE UPLOAD
  @Post(':id/save-supply')
  @UseInterceptors(
    FileInterceptor('proofImage', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads/supply-evidence'),
        filename: (req, file, cb) => {
          const uniqueName = `supply-${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async saveSupply(
    @Param('id') supplierId: string,
    @UploadedFile() proofImage: Express.Multer.File,
    @Body()
    body: {
      itemId: string;
      qty: number;
      value: number;
      unitId: string;
      recievedBy: string;
      destinationStoreId: string;
    },
  ) {
    return await this.supplierService.createSupply(proofImage, {
      ...body,
      supplierId,
    });
  }

  @Put('supplies/modify/:supplyId')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(
    FileInterceptor('attachment', {
      storage: diskStorage({
        destination: './uploads/supplies',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = path.extname(file.originalname);
          callback(null, `supply-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async modifySupply(
    @Param('supplyId', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body()
    body: {
      itemId: string;
      qty: number;
      value: number;
      unitId: string;
      recievedBy: string;
      destinationStoreId: string;
    },
  ) {
    // Prepare update payload
    const updateData: {
      itemId: string;
      qty: number;
      value: number;
      unitId: string;
      recievedBy: string;
      destinationStoreId: string;
    } = {
      itemId: body.itemId,
      qty: Number(body.qty),
      value: Number(body.value),
      unitId: body.unitId,
      recievedBy: body.recievedBy,
      destinationStoreId: body.destinationStoreId,
      ...(file ? { proofImage: file.filename } : {}), // add file if uploaded
    };

    return await this.supplierService.modifySupply(id, updateData);
  }

  @Delete('supplies/delete/:supplyId')
  @HttpCode(HttpStatus.OK)
  async deleteSupply(@Param('supplyId') id: string) {
    return await this.supplierService.deleteSupply(id);
  }

  // ✅ SUPPLIER PAYMENTS
  @Post('payments')
  @UseInterceptors(
    FileInterceptor('proofImage', {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads/supply-payment-evidence'),
        filename: (req, file, cb) => {
          const uniqueName = `supply-${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  @HttpCode(HttpStatus.OK)
  async processSupplierPayment(
    @Body() body: SupplierPaymentDto,
    @UploadedFile() proofImage?: Express.Multer.File,
  ) {
    const fileToSend = proofImage ?? null;
    return await this.supplierService.processSupplierPayment(fileToSend, body);
  }

  @Put('payments/:paymentId')
  @HttpCode(HttpStatus.OK)
  async modifyPayment(
    @Param('paymentId') id: string,
    @Body() updatePaymentDto: Prisma.SupplyPaymentsUpdateInput,
  ) {
    return await this.supplierService.modifyPayment(id, updatePaymentDto);
  }

  @Delete('payments/delete/:paymentId')
  @HttpCode(HttpStatus.OK)
  async deletePayment(@Param('paymentId') id: string) {
    return await this.supplierService.deletePayment(id);
  }

  @Get('report')
  @HttpCode(HttpStatus.OK)
  async getSupplierReport() {
    return await this.supplierService.getAllSuppliersReport();
  }

  @Get('report/export')
  @HttpCode(HttpStatus.OK)
  async exportSuppliersReportPDF() {
    return await this.supplierService.exportSuppliersReportPDF();
  }
}
