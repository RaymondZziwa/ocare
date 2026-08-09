import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateEmployeeDto,
  employeeProfileUpdateDto,
  //saveEmployeeSystemSettingsDto,
  UpdateEmployeeDto,
} from 'src/dto/humanResource.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Gender } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

@Injectable()
export class EmployeeService {
  constructor(private readonly prisma: PrismaService) {}
  private readonly saltRounds = 12;

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.saltRounds);
    return bcrypt.hash(password, salt);
  }

  async create(dto: CreateEmployeeDto) {
    try {
      const hashedPassword = await this.hashPassword(dto.password);
      await this.prisma.employee.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          gender: dto.gender as Gender,
          email: dto.email,
          tel: dto.tel,
          password: hashedPassword,
          hasAccess: dto.hasAccess ?? false,
          isActive: dto.isActive ?? true,
          branchId: dto.branchId,
          roleId: dto.roleId,
        },
      });
      return {
        status: 201,
        data: [],
        message: 'Employee has been saved successfully',
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }

  async findAll() {
    const emps = await this.prisma.employee.findMany({
      include: {
        branch: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      status: 200,
      data: emps,
      message: 'Employees fetched successfully',
    };
  }

  async findOne(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      include: {
        branch: true,
      },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with id ${id} not found`);
    }
    return employee;
  }

  async update(id: string, dto: UpdateEmployeeDto) {
    await this.findOne(id);

    await this.prisma.employee.update({
      where: { id },
      data: dto as Prisma.EmployeeUncheckedUpdateInput,
    });

    return {
      status: 200,
      data: [],
      message: 'Employee modified successfully',
    };
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.employee.delete({
      where: { id },
    });
    return {
      status: 200,
      data: [],
      message: 'Employees deleted successfully',
    };
  }

  // async updateProfileImage(employeeId: string, file: Express.Multer.File) {
  //   if (!file) {
  //     throw new NotFoundException('No file uploaded');
  //   }

  //   const imagePath = `/uploads/images/${file.filename}`;

  //   // ✅ Optional: delete old image
  //   const employee = await this.prisma.employee.findUnique({
  //     where: { id: employeeId },
  //   });

  //   if (!employee) {
  //     throw new NotFoundException('Employee not found');
  //   }

  //   // ✅ Update database
  //   await this.prisma.employee.update({
  //     where: { id: employeeId },
  //     data: { profileImage: imagePath },
  //   });

  //   return {
  //     message: 'Profile image updated successfully',
  //     imageUrl: imagePath,
  //   };
  // }

  async exportEmployeeData(id: string) {
    await this.findOne(id);
  }

  async employeeProfileUpdate(id: string, dto: employeeProfileUpdateDto) {
    const employee = await this.findOne(id);

    if (!employee) {
      throw new NotFoundException(`Employee with id ${id} not found`);
    }

    const updatedData: Prisma.EmployeeUncheckedUpdateInput = {
      email: dto.email ?? employee.email,
      tel: dto.tel ?? employee.tel,
    };

    if (dto.password) {
      const hashedPassword = await this.hashPassword(dto.password);
      updatedData.password = hashedPassword;
    }

    await this.prisma.employee.update({
      where: { id },
      data: updatedData,
    });

    return {
      status: 200,
      data: [],
      message: 'Employee profile updated successfully',
    };
  }

  async saveEmployeeSystemSettings(
    id: string,
    //dto: saveEmployeeSystemSettingsDto,
  ) {
    await this.findOne(id);
  }

  async disableAccount(id: string) {
    await this.findOne(id);
    await this.prisma.employee.update({
      where: { id },
      data: { hasAccess: false },
    });
    return {
      status: 200,
      data: [],
      message: 'Employee Account disabled successfully',
    };
  }
}
