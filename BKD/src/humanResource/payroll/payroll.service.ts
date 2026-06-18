import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateAttendanceDto,
  CreatePayrollDto,
  UpdateAttendanceDto,
} from 'src/dto/attendance.dto';
import {
  CreatePayrollPeriodDto,
  PaymentStructureDto,
} from 'src/dto/payroll.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class PayrollService {
  constructor(private readonly prisma: PrismaService) {}

  async createAttendance(createAttendanceDto: CreateAttendanceDto) {
    const { date, employeeId, timeIn, timeOut, notes } = createAttendanceDto;

    // Check if employee exists
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    // Check if attendance already exists for this employee on this date
    const existingAttendance = await this.prisma.attendance.findFirst({
      where: {
        date,
        employeeId,
      },
    });

    if (existingAttendance) {
      throw new ConflictException(
        `Attendance already recorded for this employee on date ${date}`,
      );
    }

    const attendance = await this.prisma.attendance.create({
      data: {
        date,
        employeeId,
        timeIn: new Date(timeIn),
        timeOut: timeOut ? new Date(timeOut) : null,
        notes: notes || null,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return {
      message: 'Attendance recorded successfully',
      data: attendance,
      status: 201,
    };
  }

  async getDailyAttendanceSheet(date?: string) {
    // Use provided date or default to today
    const targetDate = date ? new Date(date) : new Date();
    const dateString = targetDate.toISOString().split('T')[0]; // Format as YYYY-MM-DD

    console.log(dateString);

    // Get all attendances for the specified date
    const attendances = await this.prisma.attendance.findMany({
      where: {
        date: dateString,
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            dept: true,
          },
        },
      },
      orderBy: {
        timeIn: 'asc', // Order by time in ascending order
      },
    });

    // Calculate summary statistics
    const totalEmployees = attendances.length;
    const employeesPresent = attendances.filter(
      (att) => att.timeOut !== null,
    ).length;
    const employeesStillWorking = attendances.filter(
      (att) => att.timeOut === null,
    ).length;

    // Calculate average working hours for those who have clocked out
    const employeesWithTimeOut = attendances.filter(
      (att) => att.timeOut !== null,
    );
    const totalWorkingHours = employeesWithTimeOut.reduce((total, att) => {
      const hoursWorked =
        att?.timeIn && att?.timeOut
          ? (att.timeOut.getTime() - att.timeIn.getTime()) / (1000 * 60 * 60)
          : 0;
      return total + hoursWorked;
    }, 0);

    const averageWorkingHours =
      employeesWithTimeOut.length > 0
        ? totalWorkingHours / employeesWithTimeOut.length
        : 0;

    // Format the response with additional calculated fields
    const formattedAttendances = attendances.map((attendance) => {
      const hoursWorked = attendance.timeOut
        ? (attendance.timeOut.getTime() - attendance.timeIn.getTime()) /
          (1000 * 60 * 60)
        : null;

      const status = attendance.timeOut ? 'CLOCKED_OUT' : 'STILL_WORKING';

      return {
        ...attendance,
        hoursWorked: hoursWorked ? Number(hoursWorked.toFixed(2)) : null,
        status,
      };
    });

    return {
      message: `Daily attendance sheet retrieved successfully for ${dateString}`,
      data: {
        date: dateString,
        summary: {
          totalEmployees,
          employeesPresent,
          employeesStillWorking,
          averageWorkingHours: Number(averageWorkingHours.toFixed(2)),
          totalWorkingHours: Number(totalWorkingHours.toFixed(2)),
        },
        attendances: formattedAttendances,
      },
      status: 200,
    };
  }

  async getAllAttendances() {
    const attendances = await this.prisma.attendance.findMany({
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return {
      message: 'Attendances retrieved successfully',
      data: attendances,
      status: 200,
    };
  }

  async getAttendanceById(id: number) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!attendance) {
      throw new NotFoundException(`Attendance with ID ${id} not found`);
    }

    return {
      message: 'Attendance retrieved successfully',
      data: attendance,
      status: 200,
    };
  }

  async getAttendancesByEmployee(employeeId: string) {
    // Check if employee exists
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${employeeId} not found`);
    }

    const attendances = await this.prisma.attendance.findMany({
      where: { employeeId },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return {
      message: 'Employee attendances retrieved successfully',
      data: attendances,
      status: 200,
    };
  }

  async updateAttendance(
    id: number,
    updateAttendanceDto: UpdateAttendanceDto,
  ) {
    const company = await this.prisma.company.findFirst();
    const attendance = await this.prisma.attendance.findUnique({
      where: { id },
    });

    if (!attendance) {
      throw new NotFoundException(`Attendance with ID ${id} not found`);
    }

    if (!updateAttendanceDto.timeOut) {
      throw new BadRequestException(`timeOut is required to update attendance`);
    }

    const timeIn = attendance.timeIn;
    const timeOut = new Date(updateAttendanceDto.timeOut);

    // Calculate hours worked
    const hoursWorked =
      (timeOut.getTime() - timeIn.getTime()) / (1000 * 60 * 60);

    const expectedHours = company?.workHours || 8;
    const hoursMissed = Math.max(expectedHours - hoursWorked, 0); // Avoid negative

    const updatedAttendance = await this.prisma.attendance.update({
      where: { id },
      data: {
        timeOut,
        missedHours: hoursMissed,
        ...(updateAttendanceDto.notes !== undefined && {
          notes: updateAttendanceDto.notes || null,
        }),
      },
      include: {
        employee: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return {
      message: 'Attendance updated successfully',
      data: updatedAttendance,
      status: 200,
    };
  }

  async deleteAttendance(id: number) {
    const attendance = await this.prisma.attendance.findUnique({
      where: { id },
    });

    if (!attendance) {
      throw new NotFoundException(`Attendance with ID ${id} not found`);
    }

    await this.prisma.attendance.delete({
      where: { id },
    });

    return {
      message: 'Attendance deleted successfully',
      status: 200,
    };
  }

  async getAttendanceSummaryByPeriod(startDate: string, endDate: string) {
    // 1. Get company details
    const company = await this.prisma.company.findFirst();

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const workHours = company.workHours || 8;

    // 2. Get employees and attendance records in range
    const employees = await this.prisma.employee.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        salary: true,
        branch: { select: { name: true } },
        role: { select: { name: true } },
        dept: { select: { name: true } },
        Attendance: {
          where: {
            date: { gte: startDate, lte: endDate },
          },
        },
      },
    });

    // 3. Calculate number of days between start and end date (inclusive)
    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays =
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // 4. Compute totals per employee
    const report = employees.map((emp) => {
      const totalWorkedHours = emp.Attendance.reduce((sum, a) => {
        if (a.timeOut) {
          const worked =
            (new Date(a.timeOut).getTime() - new Date(a.timeIn).getTime()) /
            (1000 * 60 * 60);
          return sum + worked;
        }
        return sum;
      }, 0);

      const totalExpectedHours = totalDays * workHours;
      const totalMissedHours = Math.max(
        totalExpectedHours - totalWorkedHours,
        0,
      );

      const attendanceRate =
        totalExpectedHours > 0
          ? ((totalWorkedHours / totalExpectedHours) * 100).toFixed(2)
          : '0';

      return {
        employeeId: emp.id,
        name: `${emp.firstName} ${emp.lastName}`,
        salary: emp.salary,
        branch: emp.branch?.name || 'N/A',
        role: emp.role?.name || 'N/A',
        department: emp.dept?.name || 'N/A',
        totalDays,
        totalExpectedHours,
        totalWorkedHours: +totalWorkedHours.toFixed(2),
        totalMissedHours: +totalMissedHours.toFixed(2),
        attendanceRate: `${attendanceRate}%`,
      };
    });

    // 5. Return structured response
    return {
      status: 200,
      message: 'Attendance summary fetched successfully',
      company: {
        id: company.id,
        name: company.name,
        workHours: company.workHours,
      },
      dateRange: { startDate, endDate },
      data: report,
    };
  }

  // Create a Payroll Period along with Payroll records
  async createPayrollPeriod(dto: CreatePayrollPeriodDto) {
    // Create PayrollPeriod first
    const payrollPeriod = await this.prisma.payrollPeriods.create({
      data: {
        periodStart: dto.periodStart,
        periodEnd: dto.periodEnd,
        payDate: dto.payDate,
        totalSpent: dto.totalSpent,
        payrolls: {
          create: dto.paymentStructure.map((p) => ({
            paymentStructure: p as unknown as Prisma.JsonObject,
          })),
        },
      },
      include: {
        payrolls: true,
      },
    });

    return {
      data: payrollPeriod,
      status: 200,
      message: 'Payroll saved successfully',
    };
  }

  // Get a single Payroll Period by ID
  async getPayrollPeriod(id: number) {
    const payrollPeriod = await this.prisma.payrollPeriods.findUnique({
      where: { id },
      include: { payrolls: true }, // include Payrolls
    });

    if (!payrollPeriod) throw new NotFoundException('Payroll period not found');
    return payrollPeriod;
  }

  // List all Payroll Periods
  async listPayrollPeriods() {
    const payrolls = await this.prisma.payrollPeriods.findMany({
      include: { payrolls: true }, // include Payrolls
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: payrolls,
      status: 200,
      message: 'Payroll periods fetched successfully',
    };
  }

  // Update a Payroll Period
  async updatePayrollPeriod(id: number, dto: Partial<CreatePayrollPeriodDto>) {
    const payrollPeriod = await this.prisma.payrollPeriods.update({
      where: { id },
      data: {
        periodStart: dto.periodStart,
        periodEnd: dto.periodEnd,
        payDate: dto.payDate,
        totalSpent: dto.totalSpent,
        // Optional: you can update payrolls separately if needed
      },
      include: { payrolls: true },
    });

    if (!payrollPeriod) throw new NotFoundException('Payroll period not found');
    return payrollPeriod;
  }

  // Add or update Payroll records inside a PayrollPeriod
  async upsertPayrolls(
    payrollPeriodId: number,
    payrolls: PaymentStructureDto[],
  ) {
    const upserted = await Promise.all(
      payrolls.map((p) =>
        this.prisma.payroll.upsert({
          where: { id: p.employeeId }, // use PK logic
          update: { paymentStructure: p as unknown as Prisma.JsonObject },
          create: {
            payrollPeriodId,
            paymentStructure: p as unknown as Prisma.JsonObject,
          },
        }),
      ),
    );

    return upserted;
  }

  // Delete a payroll period by ID
  async deletePayrollPeriod(id: number) {
    await this.getPayrollPeriod(id); // Check if exists
    return this.prisma.payrollPeriods.delete({ where: { id } });
  }
}
