import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import {
  CreateBranchExpenseDto,
  UpdateBranchExpenseDto,
} from 'src/dto/expenses.dto';
import { BranchExpenseService } from './expenses.service';

@Controller('api/branch-expenses')
export class BranchExpenseController {
  constructor(private readonly service: BranchExpenseService) {}

  @Post('create')
  create(@Body() dto: CreateBranchExpenseDto) {
    return this.service.create(dto);
  }

  @Get('fetch-all/:id')
  findAll(
    @Param('id') id: string,
    @Query('branchId') branchId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.service.findAll(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put('modify/:id')
  update(@Param('id') id: string, @Body() dto: UpdateBranchExpenseDto) {
    return this.service.update(id, dto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
