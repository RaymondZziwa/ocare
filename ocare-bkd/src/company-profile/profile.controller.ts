import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';
import { CompanyService } from './profile.service';

@Controller('api/company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get('profile')
  getCompanyProfile() {
    return this.companyService.getProfile();
  }

  @Patch('modify/:id')
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: './uploads/logos',
        filename: (req, file, cb) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async updateCompany(
    @Param('id') id: string,
    @UploadedFile() logo: Express.Multer.File,
    @Body() body: any,
  ) {
    const logoPath = logo ? `/uploads/logos/${logo.filename}` : undefined;

    const phoneNumbers = body.phoneNumbers
  ? typeof body.phoneNumbers === 'string'
    ? JSON.parse(body.phoneNumbers)
    : body.phoneNumbers
  : undefined;


    const payload = {
      ...body,
      phoneNumbers,
      logoPath,
    };

    // Remove undefined values
    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) {
        delete payload[key];
      }
    });

    return this.companyService.update(id, payload);
  }
}
