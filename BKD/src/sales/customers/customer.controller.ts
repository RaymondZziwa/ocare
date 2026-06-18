import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  CreateClientDto,
  reviewPrescriptionDto,
  UpdateClientDto,
} from 'src/dto/client.dto';
import { ClientService } from './customer.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join, extname } from 'path';

@Controller('api/clients')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post('create')
  create(@Body() dto: CreateClientDto) {
    return this.clientService.create(dto);
  }

  @Get('fetch-all')
  findAll() {
    return this.clientService.findAll();
  }

  @Get('fetch/:id')
  findOne(@Param('id') id: string) {
    return this.clientService.findOne(id);
  }

  @Get('fetch-purchases/:id')
  findClientPurchases(@Param('id') id: string) {
    return this.clientService.getClientPurchases(id);
  }

  @Put('modify/:id')
  update(@Param('id') id: string, @Body() dto: UpdateClientDto) {
    return this.clientService.update(id, dto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.clientService.remove(id);
  }

  @Post('upload-prescription/:id')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads/prescription'),
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `prescription-${uniqueSuffix}${ext}`);
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
  async uploadClientPrescriptions(
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() body: { notes: string; prescribedBy: string },
  ) {
    return await this.clientService.uploadPrescriptionImages(id, files, body);
  }

  @Get('fetch-prescriptions/:id')
  findClientPrescriptions(@Param('id') id: string) {
    return this.clientService.getPrescriptions(id);
  }

  @Get('fetch-prescription-history/:id')
  findPrescriptionHistory(
    @Param('id') id: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.clientService.prescriptionHistory(id, startDate, endDate);
  }

  @Put('review-prescription/:id')
  reviewPrescription(
    @Param('id') id: string,
    @Body() dto: reviewPrescriptionDto,
  ) {
    console.log(id, dto);
    return this.clientService.reviewPescription(id, dto);
  }

  @Get('fetch-all-prescriptions')
  findAllClientPrescriptions() {
    return this.clientService.allPrescriptionHistory();
  }
}
