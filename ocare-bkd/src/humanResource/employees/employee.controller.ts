import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { EmployeeService } from './employee.service';
import {
  CreateEmployeeDto,
  employeeProfileUpdateDto,
  ///saveEmployeeSystemSettingsDto,
  UpdateEmployeeDto,
} from 'src/dto/humanResource.dto';

@Controller('api/employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post('create')
  create(@Body() dto: CreateEmployeeDto) {
    return this.employeeService.create(dto);
  }

  @Get('fetch-all')
  findAll() {
    return this.employeeService.findAll();
  }

  @Get('fetch/:id')
  findOne(@Param('id') id: string) {
    return this.employeeService.findOne(id);
  }

  @Patch('modify/:id')
  update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    return this.employeeService.update(id, dto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.employeeService.remove(id);
  }

  @Put('update-profile/:id')
  profileUpdate(
    @Param('id') id: string,
    @Body() dto: employeeProfileUpdateDto,
  ) {
    return this.employeeService.employeeProfileUpdate(id, dto);
  }

  /**
   * ✅ Upload and update employee profile picture
   */
  // @Post('upload-profile-picture/:id')
  // @UseInterceptors(
  //   FileInterceptor('file', {
  //     storage: diskStorage({
  //       destination: join(process.cwd(), 'uploads/images'),
  //       filename: (req, file, cb) => {
  //         const uniqueSuffix =
  //           Date.now() + '-' + Math.round(Math.random() * 1e9);
  //         const ext = extname(file.originalname);
  //         cb(null, `employee-${uniqueSuffix}${ext}`);
  //       },
  //     }),
  //     fileFilter: (req, file, cb) => {
  //       if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
  //         cb(new Error('Only image files are allowed!'), false);
  //       } else {
  //         cb(null, true);
  //       }
  //     },
  //     limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  //   }),
  // )
  // async uploadProfilePicture(
  //   @Param('id') id: string,
  //   @UploadedFile() file: Express.Multer.File,
  // ) {
  //   return await this.employeeService.updateProfileImage(id, file);
  // }

  @Get('export-profile')
  exportProfile(@Param('id') id: string) {
    return this.employeeService.exportEmployeeData(id);
  }

  @Post('save-settings/:id')
  saveEmployeeSettings(
    @Param('id') id: string,
    //@Body() dto: saveEmployeeSystemSettingsDto,
  ) {
    return this.employeeService.saveEmployeeSystemSettings(id);
  }

  @Put('disable/:id')
  disableEmployeeAccount(@Param('id') id: string) {
    return this.employeeService.disableAccount(id);
  }
}
